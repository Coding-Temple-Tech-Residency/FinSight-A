"""
Unit + integration tests for portfolio, holding, and transaction endpoints.
"""
from decimal import Decimal


def create_portfolio_helper(client, auth_headers, name="Test Portfolio"):
    """Helper to create a portfolio and return its response JSON."""
    response = client.post(
        "/api/v1/portfolios",
        json={"name": name, "description": "Test description"},
        headers=auth_headers
    )
    return response.json()


def test_create_portfolio_success(client, auth_headers):
    """Authenticated user can create a portfolio."""
    response = client.post(
        "/api/v1/portfolios",
        json={"name": "My Portfolio", "description": "Retirement fund"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "My Portfolio"
    assert "id" in data


def test_create_portfolio_unauthenticated_fails(client):
    """Unauthenticated request to create portfolio returns 401."""
    response = client.post(
        "/api/v1/portfolios",
        json={"name": "My Portfolio"}
    )
    assert response.status_code == 401


def test_list_portfolios(client, auth_headers):
    """User can list their own portfolios."""
    create_portfolio_helper(client, auth_headers, "Portfolio 1")
    create_portfolio_helper(client, auth_headers, "Portfolio 2")

    response = client.get("/api/v1/portfolios", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["portfolios"]) == 2


def test_get_portfolio_by_id(client, auth_headers):
    """User can fetch a specific portfolio by ID."""
    created = create_portfolio_helper(client, auth_headers)
    portfolio_id = created["id"]

    response = client.get(f"/api/v1/portfolios/{portfolio_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == portfolio_id


def test_get_nonexistent_portfolio_fails(client, auth_headers):
    """Fetching non-existent portfolio returns 404."""
    response = client.get(
        "/api/v1/portfolios/00000000-0000-0000-0000-000000000000",
        headers=auth_headers
    )
    assert response.status_code == 404


def test_update_portfolio(client, auth_headers):
    """User can update their portfolio's name."""
    created = create_portfolio_helper(client, auth_headers)
    portfolio_id = created["id"]

    response = client.patch(
        f"/api/v1/portfolios/{portfolio_id}",
        json={"name": "Updated Name"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


def test_delete_portfolio(client, auth_headers):
    """User can delete their portfolio."""
    created = create_portfolio_helper(client, auth_headers)
    portfolio_id = created["id"]

    response = client.delete(f"/api/v1/portfolios/{portfolio_id}", headers=auth_headers)
    assert response.status_code == 204

    get_response = client.get(f"/api/v1/portfolios/{portfolio_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_create_buy_transaction_creates_holding(client, auth_headers):
    """Creating a buy transaction auto-creates a holding."""
    created = create_portfolio_helper(client, auth_headers)
    portfolio_id = created["id"]

    response = client.post(
        f"/api/v1/portfolios/{portfolio_id}/transactions",
        json={
            "symbol": "AAPL",
            "type": "buy",
            "quantity": "10",
            "price_at_trade": "150.00"
        },
        headers=auth_headers
    )
    assert response.status_code == 201

    holdings_response = client.get(
        f"/api/v1/portfolios/{portfolio_id}/holdings",
        headers=auth_headers
    )
    holdings = holdings_response.json()["holdings"]
    assert len(holdings) == 1
    assert holdings[0]["symbol"] == "AAPL"
    assert Decimal(holdings[0]["quantity"]) == Decimal("10")


def test_weighted_average_cost_calculation(client, auth_headers):
    """Multiple buys calculate correct weighted average cost."""
    created = create_portfolio_helper(client, auth_headers)
    portfolio_id = created["id"]

    # First buy: 10 shares @ $100
    client.post(
        f"/api/v1/portfolios/{portfolio_id}/transactions",
        json={"symbol": "AAPL", "type": "buy", "quantity": "10", "price_at_trade": "100.00"},
        headers=auth_headers
    )

    # Second buy: 10 shares @ $200
    client.post(
        f"/api/v1/portfolios/{portfolio_id}/transactions",
        json={"symbol": "AAPL", "type": "buy", "quantity": "10", "price_at_trade": "200.00"},
        headers=auth_headers
    )

    holdings_response = client.get(
        f"/api/v1/portfolios/{portfolio_id}/holdings",
        headers=auth_headers
    )
    holdings = holdings_response.json()["holdings"]

    # Weighted avg: (10*100 + 10*200) / 20 = 150
    assert Decimal(holdings[0]["avg_cost"]) == Decimal("150.000000")
    assert Decimal(holdings[0]["quantity"]) == Decimal("20")


def test_sell_reduces_holding_quantity(client, auth_headers):
    """Selling reduces holding quantity without changing avg_cost."""
    created = create_portfolio_helper(client, auth_headers)
    portfolio_id = created["id"]

    client.post(
        f"/api/v1/portfolios/{portfolio_id}/transactions",
        json={"symbol": "AAPL", "type": "buy", "quantity": "10", "price_at_trade": "100.00"},
        headers=auth_headers
    )

    client.post(
        f"/api/v1/portfolios/{portfolio_id}/transactions",
        json={"symbol": "AAPL", "type": "sell", "quantity": "4", "price_at_trade": "120.00"},
        headers=auth_headers
    )

    holdings_response = client.get(
        f"/api/v1/portfolios/{portfolio_id}/holdings",
        headers=auth_headers
    )
    holdings = holdings_response.json()["holdings"]
    assert Decimal(holdings[0]["quantity"]) == Decimal("6")
    assert Decimal(holdings[0]["avg_cost"]) == Decimal("100.000000")


def test_sell_all_shares_removes_holding(client, auth_headers):
    """Selling all shares removes the holding entirely."""
    created = create_portfolio_helper(client, auth_headers)
    portfolio_id = created["id"]

    client.post(
        f"/api/v1/portfolios/{portfolio_id}/transactions",
        json={"symbol": "AAPL", "type": "buy", "quantity": "10", "price_at_trade": "100.00"},
        headers=auth_headers
    )

    client.post(
        f"/api/v1/portfolios/{portfolio_id}/transactions",
        json={"symbol": "AAPL", "type": "sell", "quantity": "10", "price_at_trade": "120.00"},
        headers=auth_headers
    )

    holdings_response = client.get(
        f"/api/v1/portfolios/{portfolio_id}/holdings",
        headers=auth_headers
    )
    assert len(holdings_response.json()["holdings"]) == 0


def test_list_transactions_pagination(client, auth_headers):
    """Transaction list supports pagination."""
    created = create_portfolio_helper(client, auth_headers)
    portfolio_id = created["id"]

    for i in range(5):
        client.post(
            f"/api/v1/portfolios/{portfolio_id}/transactions",
            json={"symbol": "AAPL", "type": "buy", "quantity": "1", "price_at_trade": "100.00"},
            headers=auth_headers
        )

    response = client.get(
        f"/api/v1/portfolios/{portfolio_id}/transactions?page=1&limit=3",
        headers=auth_headers
    )
    data = response.json()
    assert len(data["transactions"]) == 3
    assert data["total"] == 5


def test_cannot_access_other_users_portfolio(client, auth_headers, db_session):
    """User cannot access another user's portfolio (ownership check)."""
    from app.models.user import User
    from app.core.security import hash_password, create_access_token

    other_user = User(
        email="other@finsight.dev",
        password_hash=hash_password("OtherPass123"),
        is_active=True,
    )
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)

    other_token = create_access_token(subject=other_user.id)
    other_headers = {"Cookie": f"access_token={other_token}"}

    created = create_portfolio_helper(client, auth_headers)
    portfolio_id = created["id"]

    response = client.get(f"/api/v1/portfolios/{portfolio_id}", headers=other_headers)
    assert response.status_code == 404
