import time
import httpx
from app.core.config import get_settings

settings = get_settings()

_cache: dict[str, tuple] = {}  # key -> (data, timestamp)
CACHE_TTL = 60  # seconds


def _from_cache(key: str):
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
    return None


def _store_cache(key: str, data):
    _cache[key] = (data, time.time())


def _is_rate_limited(body: dict) -> bool:
    """Alpha Vantage signals rate limits in the JSON body, not via HTTP status."""
    return "Information" in body or "Note" in body


def get_top_movers() -> dict:
    """
    Returns {"top_gainers": [...], "top_losers": [...]} or empty lists on error/rate-limit.
    Results are cached for CACHE_TTL seconds.
    """
    cached = _from_cache("top_movers")
    if cached is not None:
        return cached

    empty = {"top_gainers": [], "top_losers": []}

    if not settings.alpha_vantage_api_key:
        return empty

    try:
        resp = httpx.get(
            "https://www.alphavantage.co/query",
            params={"function": "TOP_GAINERS_LOSERS", "apikey": settings.alpha_vantage_api_key},
            timeout=10,
        )
        body = resp.json()

        if _is_rate_limited(body):
            return empty

        result = {
            "top_gainers": body.get("top_gainers", [])[:10],
            "top_losers": body.get("top_losers", [])[:10],
        }
        _store_cache("top_movers", result)
        return result

    except Exception:
        return empty


def get_quote(symbol: str) -> dict | None:
    """
    Returns a quote dict for the given symbol, or None on error/rate-limit.
    Results are cached per symbol for CACHE_TTL seconds.
    """
    key = f"quote_{symbol.upper()}"
    cached = _from_cache(key)
    if cached is not None:
        return cached

    if not settings.alpha_vantage_api_key:
        return None

    try:
        resp = httpx.get(
            "https://www.alphavantage.co/query",
            params={
                "function": "GLOBAL_QUOTE",
                "symbol": symbol.upper(),
                "apikey": settings.alpha_vantage_api_key,
            },
            timeout=10,
        )
        body = resp.json()

        if _is_rate_limited(body):
            return None

        quote = body.get("Global Quote", {})
        if not quote:
            return None

        result = {
            "symbol": quote.get("01. symbol", symbol.upper()),
            "price": quote.get("05. price"),
            "change": quote.get("09. change"),
            "change_percent": quote.get("10. change percent"),
            "volume": quote.get("06. volume"),
            "latest_trading_day": quote.get("07. latest trading day"),
        }
        _store_cache(key, result)
        return result

    except Exception:
        return None
