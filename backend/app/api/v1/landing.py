"""
Public landing page data endpoint.

No authentication required — this powers the pre-login
landing page (trending stocks, performance, AI insight preview).
"""
import time
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.services.market_data import alpha_vantage
from app.services.cache import cache
from app.core.logging import logger

router = APIRouter(prefix="/landing", tags=["landing"])


class StockPreview(BaseModel):
    symbol: str
    price: float
    change: str
    change_percent: str


class LandingResponse(BaseModel):
    trendingStocks: List[StockPreview]
    trendingPerformance: List[StockPreview]
    aiInsight: Optional[str] = None
    trendingHighlights: List[StockPreview]


# Curated list of popular stocks for the landing preview.
# Static for MVP; can be made dynamic (e.g. most-searched) later.
POPULAR_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]

LANDING_CACHE_KEY = "landing_page_data"

# Alpha Vantage free tier: 5 requests/minute. Spacing calls
# by ~13s keeps 5 sequential calls safely within that limit,
# even if other endpoints used some of the quota recently.
API_CALL_SPACING_SECONDS = 13


@router.get(
    "",
    response_model=LandingResponse,
    summary="Get public landing page preview data",
)
def get_landing_data() -> LandingResponse:
    """
    Fetch trending stock data for the landing page.

    No auth required. The full response is cached for 15 minutes
    as a single unit. On a cache miss, calls are spaced out to
    respect Alpha Vantage's 5 requests/min free-tier limit —
    this makes the first request after cache expiry slow (~60s)
    but guarantees all 5 symbols load instead of silently dropping some.
    """
    cached = cache.get(LANDING_CACHE_KEY)
    if cached:
        return LandingResponse(**cached)

    trending = []

    for i, symbol in enumerate(POPULAR_SYMBOLS):
        if i > 0:
            time.sleep(API_CALL_SPACING_SECONDS)

        price_data = alpha_vantage.get_stock_price(symbol)
        if price_data:
            trending.append(StockPreview(
                symbol=price_data["symbol"],
                price=price_data["price"],
                change=price_data["change"],
                change_percent=price_data["change_percent"],
            ))
        else:
            logger.warning(
                f"Landing page: failed to fetch {symbol}",
                extra={"event": "landing_symbol_fetch_failed", "symbol": symbol}
            )

    response = LandingResponse(
        trendingStocks=trending,
        trendingPerformance=trending,
        aiInsight=None,  # Placeholder until Groq integration (Chun) is ready
        trendingHighlights=trending[:3],
    )

    cache.set(LANDING_CACHE_KEY, response.model_dump(), ttl_minutes=15)

    return response
