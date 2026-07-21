"""
Market data service using yfinance (replaces Alpha Vantage).

The singleton is still exported as `alpha_vantage` so market_trends.py
and any other callers work without modification.
"""
from datetime import datetime
from typing import Any, Dict, Optional

import yfinance as yf

from app.services.cache import cache


class YFinanceClient:
    """yfinance-backed stock data client. Drop-in replacement for AlphaVantageClient."""

    def get_stock_price(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Fetch current stock price (with 15-min cache).

        Returns dict with: symbol, price, timestamp, currency, change, change_percent
        or None if the symbol is invalid or data is unavailable.
        """
        sym = symbol.upper()
        cache_key = f"stock_price_{sym}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            fi = yf.Ticker(sym).fast_info
            price = fi.last_price
            prev = fi.previous_close
            if price is None:
                return None

            change = float(price) - float(prev) if prev else 0.0
            change_pct = (change / float(prev) * 100) if prev else 0.0

            price_data = {
                "symbol": sym,
                "price": round(float(price), 2),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "currency": "USD",
                "change": f"{change:+.4f}",
                "change_percent": f"{change_pct:+.4f}%",
            }
            cache.set(cache_key, price_data, ttl_minutes=15)
            return price_data

        except Exception as exc:
            print(f"yfinance error for {sym}: {exc}")
            return None


# Keep name for backward-compat — market_trends.py imports `alpha_vantage`
alpha_vantage = YFinanceClient()
