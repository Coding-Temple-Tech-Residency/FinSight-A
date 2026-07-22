"""
Portfolio performance computation service.

Primary path (basis="reconstructed"):
  For each date in the requested range, walks the transaction log to determine
  what positions existed as of that date, then values them at the day's closing
  price from PriceHistory. This gives a market-close value-over-time series
  that reflects actual trades.

Fallback path (basis="current_holdings_fallback"):
  Used when the portfolio has no transaction history (positions were added
  manually via the holdings endpoint). Values the current holdings snapshot
  at each day's closing price across the window.

Weekend / market-holiday gaps:
  Missing PriceHistory rows are filled by carrying forward the most recent
  known close, so the series never drops to zero on non-trading days.

Pre-warming:
  Before computing, every symbol in the portfolio is checked for stale or
  missing PriceHistory data and refreshed via yfinance when needed.
  The request session's read transaction is committed first so the yfinance
  writer (which opens its own SessionLocal) can acquire a write lock on
  SQLite without a "database is locked" error.

IMPORTANT: Values represent market-close portfolio worth, NOT a formal
time-weighted return. Cash deposits and withdrawals are not netted out.
"""

from datetime import date, timedelta, datetime
from decimal import Decimal
from typing import Dict, List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.portfolio import Holding, Transaction
from app.models.price_history import PriceHistory
from app.services.price_history import price_history_service

DISCLAIMER = (
    "Values show estimated market-close portfolio worth on each date based on "
    "logged transactions and daily closing prices. This is NOT a time-weighted "
    "return and does not net out cash deposits or withdrawals."
)

_STALE_DAYS = 3


def _build_date_range(range_param: str) -> Tuple[date, date]:
    today = date.today()
    if range_param == "1W":
        return today - timedelta(weeks=1), today
    if range_param == "1M":
        return today - timedelta(days=30), today
    if range_param == "YTD":
        return date(today.year, 1, 1), today
    return today - timedelta(days=365), today


def _dates_in_range(start: date, end: date) -> List[date]:
    out, cur = [], start
    while cur <= end:
        out.append(cur)
        cur += timedelta(days=1)
    return out


def _coerce_date(val) -> Optional[date]:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    if isinstance(val, str):
        try:
            return date.fromisoformat(val[:10])
        except ValueError:
            return None
    return None


def _is_stale(symbol: str, db: Session) -> bool:
    raw = db.query(func.max(PriceHistory.date)).filter(
        PriceHistory.symbol == symbol
    ).scalar()
    latest = _coerce_date(raw)
    if latest is None:
        return True
    return (date.today() - latest).days > _STALE_DAYS


def _ensure_price_history(symbols: List[str], db: Session) -> None:
    for sym in symbols:
        if _is_stale(sym, db):
            price_history_service.fetch_and_store_history(sym)


def _build_price_map(symbol: str, start: date, end: date, db: Session) -> Dict[date, float]:
    rows = (
        db.query(PriceHistory)
        .filter(
            PriceHistory.symbol == symbol,
            PriceHistory.date >= str(start),
            PriceHistory.date <= str(end),
        )
        .order_by(PriceHistory.date)
        .all()
    )
    result = {}
    for r in rows:
        d = _coerce_date(r.date)
        if d is not None and r.close is not None:
            result[d] = float(r.close)
    return result


def _carry_forward(dates: List[date], price_map: Dict[date, float]) -> Dict[date, float]:
    """Fill missing dates (weekends/holidays) by carrying forward last known close."""
    result: Dict[date, float] = {}
    last: Optional[float] = None
    for d in dates:
        if d in price_map:
            last = price_map[d]
        if last is not None:
            result[d] = last
    return result


# ---------------------------------------------------------------------------
# Snapshot types — plain tuples extracted from ORM objects before db.commit()
# so the reconstruction logic never touches expired SQLAlchemy objects.
# ---------------------------------------------------------------------------

# (symbol, type, quantity, traded_at_date)
_TxSnap = Tuple[str, str, Decimal, Optional[date]]
# (symbol, quantity_float)
_HoldSnap = Tuple[str, float]


def _reconstruct_series(
    dates: List[date],
    tx_snaps: List[_TxSnap],
    price_maps: Dict[str, Dict[date, float]],
) -> List[Tuple[date, Optional[float]]]:
    series: List[Tuple[date, Optional[float]]] = []

    for d in dates:
        positions: Dict[str, Decimal] = {}
        for sym, ttype, qty, tx_date in tx_snaps:
            if tx_date is None or tx_date > d:
                continue
            if ttype == "buy":
                positions[sym] = positions.get(sym, Decimal(0)) + qty
            elif ttype == "sell":
                positions[sym] = positions.get(sym, Decimal(0)) - qty

        total: Optional[float] = None
        for sym, qty in positions.items():
            if qty <= 0:
                continue
            price = price_maps.get(sym, {}).get(d)
            if price is not None:
                total = (total or 0.0) + float(qty) * price

        series.append((d, total))

    return series


def _fallback_series(
    dates: List[date],
    hold_snaps: List[_HoldSnap],
    price_maps: Dict[str, Dict[date, float]],
) -> List[Tuple[date, Optional[float]]]:
    series: List[Tuple[date, Optional[float]]] = []

    for d in dates:
        total: Optional[float] = None
        for sym, qty in hold_snaps:
            if qty <= 0:
                continue
            price = price_maps.get(sym, {}).get(d)
            if price is not None:
                total = (total or 0.0) + qty * price

        series.append((d, total))

    return series


def compute_performance(portfolio_id: str, range_param: str, db: Session) -> dict:
    start, end = _build_date_range(range_param)
    all_dates = _dates_in_range(start, end)

    # --- 1. Load ORM data and immediately snapshot into plain Python types ---
    #
    # We commit the session right after to release SQLite's SHARED read lock.
    # fetch_and_store_history (pre-warm) opens its own SessionLocal and needs
    # an EXCLUSIVE write lock — which SQLite denies while any reader holds a
    # SHARED lock in the same DB file (default journal mode).
    transactions = (
        db.query(Transaction)
        .filter_by(portfolio_id=portfolio_id)
        .order_by(Transaction.traded_at)
        .all()
    )
    holdings = db.query(Holding).filter_by(portfolio_id=portfolio_id).all()

    tx_snaps: List[_TxSnap] = [
        (t.symbol, t.type, Decimal(str(t.quantity)), _coerce_date(t.traded_at))
        for t in transactions
    ]
    hold_snaps: List[_HoldSnap] = [
        (h.symbol, float(h.quantity))
        for h in holdings
    ]

    tx_symbols = list({s for s, *_ in tx_snaps})
    hold_symbols = list({s for s, _ in hold_snaps})
    all_symbols = list(set(tx_symbols + hold_symbols))

    # Release the read transaction so the write can proceed
    db.commit()

    # --- 2. Pre-warm price history (writes via its own SessionLocal) ---
    _ensure_price_history(all_symbols, db)

    # --- 3. Read price maps (fresh transaction, sees newly written rows) ---
    price_maps: Dict[str, Dict[date, float]] = {}
    for sym in all_symbols:
        raw = _build_price_map(sym, start, end, db)
        price_maps[sym] = _carry_forward(all_dates, raw)

    # --- 4. Compute series ---
    has_transactions = bool(tx_snaps)

    if has_transactions:
        basis = "reconstructed"
        raw_series = _reconstruct_series(all_dates, tx_snaps, price_maps)
    else:
        basis = "current_holdings_fallback"
        raw_series = _fallback_series(all_dates, hold_snaps, price_maps)

    series = [(d, v) for d, v in raw_series if v is not None]

    if not series:
        return {
            "portfolio_id": portfolio_id,
            "range": range_param,
            "basis": basis,
            "disclaimer": DISCLAIMER,
            "summary": {
                "start_value": 0.0,
                "end_value": 0.0,
                "change_abs": 0.0,
                "change_pct": 0.0,
            },
            "series": [],
        }

    start_val = series[0][1]
    end_val = series[-1][1]
    change_abs = end_val - start_val
    change_pct = (change_abs / start_val * 100) if start_val else 0.0

    return {
        "portfolio_id": portfolio_id,
        "range": range_param,
        "basis": basis,
        "disclaimer": DISCLAIMER,
        "summary": {
            "start_value": round(start_val, 2),
            "end_value": round(end_val, 2),
            "change_abs": round(change_abs, 2),
            "change_pct": round(change_pct, 4),
        },
        "series": [{"date": d.isoformat(), "value": round(v, 2)} for d, v in series],
    }
