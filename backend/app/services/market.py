"""
Market data service — yfinance backend.
Public interface is identical to the old Alpha Vantage version so all callers
(market.py router, ai service) work without changes.
"""
import time
from datetime import date

import yfinance as yf

_cache: dict[str, tuple] = {}
CACHE_TTL = 60  # seconds

# Curated large-cap symbols used as the movers fallback
_MOVER_SYMBOLS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "JPM", "V",
    "UNH", "WMT", "JNJ", "PG", "XOM", "BAC", "MA", "CVX", "HD", "ABBV",
    "MRK", "AVGO", "LLY", "PEP", "COST", "TMO", "MCD", "ORCL", "ACN", "AMD", "NFLX",
]


def _from_cache(key: str):
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
    return None


def _store_cache(key: str, data) -> None:
    _cache[key] = (data, time.time())


def _fmt_mover(symbol: str, price: float, change: float, change_pct: float, volume: int) -> dict:
    return {
        "ticker": symbol,
        "price": f"{price:.2f}",
        "change_amount": f"{change:+.2f}",
        "change_percentage": f"{change_pct:+.2f}%",
        "volume": str(volume),
    }


def _screener_movers() -> dict | None:
    """
    Try yfinance's built-in day_gainers / day_losers screener.
    Returns the formatted result dict or None if unavailable.
    """
    try:
        screener = yf.Screener()

        screener.set_predefined_body("day_gainers")
        gainers_quotes = (screener.response or {}).get("quotes", [])[:10]

        screener.set_predefined_body("day_losers")
        losers_quotes = (screener.response or {}).get("quotes", [])[:10]

        def _fmt(q: dict) -> dict:
            price = float(q.get("regularMarketPrice", 0) or 0)
            change = float(q.get("regularMarketChange", 0) or 0)
            change_pct = float(q.get("regularMarketChangePercent", 0) or 0)
            vol = int(q.get("regularMarketVolume", 0) or 0)
            return _fmt_mover(q.get("symbol", ""), price, change, change_pct, vol)

        result = {
            "top_gainers": [_fmt(q) for q in gainers_quotes if q.get("symbol")],
            "top_losers": [_fmt(q) for q in losers_quotes if q.get("symbol")],
        }
        if result["top_gainers"] or result["top_losers"]:
            return result
    except Exception:
        pass
    return None


def _curated_movers() -> dict:
    """
    Fallback: fetch fast_info for each symbol in the curated list and sort by % change.
    """
    rows: list[tuple] = []
    for sym in _MOVER_SYMBOLS:
        try:
            fi = yf.Ticker(sym).fast_info
            price = fi.last_price
            prev = fi.previous_close
            if price is None or not prev:
                continue
            change = float(price) - float(prev)
            change_pct = change / float(prev) * 100
            vol = int(fi.last_volume or 0)
            rows.append((sym, float(price), change, change_pct, vol))
        except Exception:
            continue

    if not rows:
        return {"top_gainers": [], "top_losers": []}

    rows.sort(key=lambda x: x[3])
    return {
        "top_gainers": [_fmt_mover(*r) for r in reversed(rows[-10:])],
        "top_losers": [_fmt_mover(*r) for r in rows[:10]],
    }


def get_top_movers() -> dict:
    """
    Returns {"top_gainers": [...], "top_losers": [...]} or empty lists on error.
    Tries the yfinance screener first; falls back to scanning the curated symbol list.
    Results cached for CACHE_TTL seconds.
    """
    cached = _from_cache("top_movers")
    if cached is not None:
        return cached

    result = _screener_movers() or _curated_movers()
    _store_cache("top_movers", result)
    return result


def get_quote(symbol: str) -> dict | None:
    """
    Returns a quote dict for the given symbol, or None on error.
    Result shape matches the old Alpha Vantage version exactly.
    Cached per symbol for CACHE_TTL seconds.
    """
    sym = symbol.upper()
    key = f"quote_{sym}"
    cached = _from_cache(key)
    if cached is not None:
        return cached

    try:
        fi = yf.Ticker(sym).fast_info
        price = fi.last_price
        prev = fi.previous_close
        if price is None:
            return None

        change = float(price) - float(prev) if prev else 0.0
        change_pct = (change / float(prev) * 100) if prev else 0.0
        volume = int(fi.last_volume or 0)

        result = {
            "symbol": sym,
            "price": f"{float(price):.2f}",
            "change": f"{change:+.2f}",
            "change_percent": f"{change_pct:+.2f}%",
            "volume": str(volume),
            "latest_trading_day": date.today().isoformat(),
        }
        _store_cache(key, result)
        return result

    except Exception:
        return None
