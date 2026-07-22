"""
Tests for GET /api/v1/portfolios/{portfolio_id}/performance.

Three scenarios:
  (a) Portfolio with transactions  → reconstructed series, non-empty, sane values
  (b) Portfolio with holdings only → fallback series, basis="current_holdings_fallback"
  (c) Auth: another user's portfolio → 404

fetch_and_store_history is always mocked to prevent real yfinance calls.
PriceHistory rows are inserted directly into the test DB so the stale check
passes without triggering a refresh.
"""

import uuid
from datetime import date, datetime, timedelta
from decimal import Decimal
from unittest.mock import patch

import pytest

from app.models.portfolio import Holding, Portfolio, Transaction
from app.models.price_history import PriceHistory


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_portfolio(client, auth_headers, name="Perf Test Portfolio"):
    r = client.post(
        "/api/v1/portfolios",
        json={"name": name, "description": ""},
        headers=auth_headers,
    )
    assert r.status_code == 201, r.text
    return r.json()


def _insert_price_history(db_session, symbol: str, close: float = 152.0, days: int = 10):
    """Insert `days` consecutive PriceHistory rows ending today so they pass the stale check."""
    today = date.today()
    for i in range(days):
        d = today - timedelta(days=i)
        db_session.add(
            PriceHistory(
                symbol=symbol,
                date=d,
                open=close - 2.0,
                high=close + 3.0,
                low=close - 3.0,
                close=close,
                volume=1_000_000,
            )
        )
    db_session.commit()


# ---------------------------------------------------------------------------
# (a) Reconstructed path — portfolio has transactions
# ---------------------------------------------------------------------------

def test_performance_reconstructed_path(client, auth_headers, test_user, db_session):
    """Portfolio with transactions produces a non-empty series (basis=reconstructed)."""
    portfolio_data = _create_portfolio(client, auth_headers)
    portfolio_id = portfolio_data["id"]

    # Insert a buy transaction 2 weeks ago so it falls inside the 1M window
    two_weeks_ago = datetime.utcnow() - timedelta(weeks=2)
    tx = Transaction(
        portfolio_id=portfolio_id,
        symbol="AAPL",
        type="buy",
        quantity=Decimal("10"),
        price_at_trade=Decimal("148.00"),
        traded_at=two_weeks_ago,
    )
    db_session.add(tx)
    db_session.commit()

    # Insert PriceHistory for AAPL for the last 35 days so the 1M window is covered
    _insert_price_history(db_session, "AAPL", close=152.0, days=35)

    with patch(
        "app.services.portfolio_performance.price_history_service.fetch_and_store_history"
    ) as mock_refresh:
        r = client.get(
            f"/api/v1/portfolios/{portfolio_id}/performance?range=1M",
            headers=auth_headers,
        )

    assert r.status_code == 200, r.text
    data = r.json()

    assert data["basis"] == "reconstructed"
    assert data["range"] == "1M"
    assert "disclaimer" in data
    assert len(data["series"]) > 0

    # 10 shares × $152 close = $1 520 per day
    for point in data["series"]:
        assert point["value"] == pytest.approx(1520.0, abs=1.0), point

    summary = data["summary"]
    assert summary["start_value"] == pytest.approx(1520.0, abs=1.0)
    assert summary["end_value"] == pytest.approx(1520.0, abs=1.0)
    assert summary["change_abs"] == pytest.approx(0.0, abs=0.1)

    # fetch_and_store_history should NOT have been called because we inserted
    # fresh PriceHistory rows above (stale check passes)
    mock_refresh.assert_not_called()


def test_performance_reconstructed_with_sell(client, auth_headers, test_user, db_session):
    """A sell transaction reduces the position value in the reconstructed series."""
    portfolio_data = _create_portfolio(client, auth_headers)
    portfolio_id = portfolio_data["id"]

    base = datetime.utcnow() - timedelta(days=20)
    db_session.add(Transaction(
        portfolio_id=portfolio_id, symbol="MSFT", type="buy",
        quantity=Decimal("20"), price_at_trade=Decimal("300.00"),
        traded_at=base,
    ))
    # Sell 5 shares 10 days ago — position drops to 15
    db_session.add(Transaction(
        portfolio_id=portfolio_id, symbol="MSFT", type="sell",
        quantity=Decimal("5"), price_at_trade=Decimal("310.00"),
        traded_at=base + timedelta(days=10),
    ))
    db_session.commit()

    _insert_price_history(db_session, "MSFT", close=300.0, days=35)

    with patch("app.services.portfolio_performance.price_history_service.fetch_and_store_history"):
        r = client.get(
            f"/api/v1/portfolios/{portfolio_id}/performance?range=1M",
            headers=auth_headers,
        )

    assert r.status_code == 200, r.text
    data = r.json()
    assert data["basis"] == "reconstructed"

    # After the sell the most-recent value should be 15 * 300 = 4500
    last_value = data["series"][-1]["value"]
    assert last_value == pytest.approx(4500.0, abs=1.0)


# ---------------------------------------------------------------------------
# (b) Fallback path — holdings only, no transactions
# ---------------------------------------------------------------------------

def test_performance_fallback_path(client, auth_headers, test_user, db_session):
    """Portfolio with holdings but no transactions → basis=current_holdings_fallback."""
    portfolio_data = _create_portfolio(client, auth_headers)
    portfolio_id = portfolio_data["id"]

    # Add a holding directly (no transaction)
    db_session.add(Holding(
        portfolio_id=portfolio_id,
        symbol="GOOGL",
        quantity=Decimal("5"),
        avg_cost=Decimal("120.00"),
    ))
    db_session.commit()

    _insert_price_history(db_session, "GOOGL", close=130.0, days=10)

    with patch("app.services.portfolio_performance.price_history_service.fetch_and_store_history"):
        r = client.get(
            f"/api/v1/portfolios/{portfolio_id}/performance?range=1W",
            headers=auth_headers,
        )

    assert r.status_code == 200, r.text
    data = r.json()

    assert data["basis"] == "current_holdings_fallback"
    assert len(data["series"]) > 0

    # 5 shares × $130 close = $650 per day
    for point in data["series"]:
        assert point["value"] == pytest.approx(650.0, abs=1.0), point


# ---------------------------------------------------------------------------
# (c) Auth — another user's portfolio returns 404
# ---------------------------------------------------------------------------

def test_performance_other_user_portfolio_returns_404(client, auth_headers, db_session):
    """User cannot access another user's portfolio performance (ownership check)."""
    from app.core.security import create_access_token, hash_password
    from app.models.user import User

    other_user = User(
        email="other_perf@finsight.dev",
        password_hash=hash_password("OtherPass123"),
        is_active=True,
    )
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)

    other_token = create_access_token(subject=other_user.id)
    other_headers = {"Cookie": f"access_token={other_token}"}

    # Current user creates a portfolio
    portfolio_data = _create_portfolio(client, auth_headers)
    portfolio_id = portfolio_data["id"]

    # Other user tries to access it
    r = client.get(
        f"/api/v1/portfolios/{portfolio_id}/performance?range=1M",
        headers=other_headers,
    )
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# (d) Validation — invalid range returns 422
# ---------------------------------------------------------------------------

def test_performance_invalid_range_returns_422(client, auth_headers):
    """Invalid range parameter is rejected before hitting any business logic."""
    portfolio_data = _create_portfolio(client, auth_headers)
    portfolio_id = portfolio_data["id"]

    r = client.get(
        f"/api/v1/portfolios/{portfolio_id}/performance?range=1D",
        headers=auth_headers,
    )
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# (e) Empty portfolio returns empty series, not 500
# ---------------------------------------------------------------------------

def test_performance_empty_portfolio_returns_empty_series(client, auth_headers):
    """Portfolio with no holdings or transactions returns an empty series gracefully."""
    portfolio_data = _create_portfolio(client, auth_headers)
    portfolio_id = portfolio_data["id"]

    with patch("app.services.portfolio_performance.price_history_service.fetch_and_store_history"):
        r = client.get(
            f"/api/v1/portfolios/{portfolio_id}/performance?range=1W",
            headers=auth_headers,
        )

    assert r.status_code == 200, r.text
    data = r.json()
    assert data["series"] == []
    assert data["summary"]["start_value"] == 0.0
    assert data["summary"]["end_value"] == 0.0
