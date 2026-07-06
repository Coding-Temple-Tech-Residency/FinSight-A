"""
Stock market data endpoints.

Provides real-time stock prices, market trends, and historical price data
using Alpha Vantage API with in-memory caching (15-minute TTL).
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.market_data import alpha_vantage
from app.services.cache import cache

router = APIRouter(prefix="/stocks", tags=["stocks"])


# ==========================================
# RESPONSE MODELS
# ==========================================

class StockPriceResponse(BaseModel):
    """Current stock price data."""
    symbol: str = Field(..., json_schema_extra={"example": "AAPL"})
    price: float = Field(..., json_schema_extra={"example": 308.63})
    timestamp: str = Field(..., json_schema_extra={"example": "2026-07-05T10:26:55.338909Z"})
    currency: str = Field(..., json_schema_extra={"example": "USD"})
    change: str = Field(..., json_schema_extra={"example": "14.2500"})
    change_percent: str = Field(..., json_schema_extra={"example": "4.8407%"})


class CacheStats(BaseModel):
    """Cache performance statistics."""
    hits: int = Field(..., json_schema_extra={"example": 45})
    misses: int = Field(..., json_schema_extra={"example": 15})
    total_requests: int = Field(..., json_schema_extra={"example": 60})
    hit_rate: str = Field(..., json_schema_extra={"example": "75.00%"})
    cached_items: int = Field(..., json_schema_extra={"example": 12})


class MarketTrendsResponse(BaseModel):
    """Market trend indicators for a stock."""
    symbol: str = Field(..., json_schema_extra={"example": "AAPL"})
    current_price: float = Field(..., json_schema_extra={"example": 308.63})
    change_24h: float = Field(..., json_schema_extra={"example": 4.84})
    trend_7d: str = Field(..., description="up, down, or neutral", json_schema_extra={"example": "up"})
    trend_30d: str = Field(..., description="up, down, or neutral", json_schema_extra={"example": "up"})
    data_points: int = Field(..., json_schema_extra={"example": 1})
    note: str = None


class PriceHistoryResponse(BaseModel):
    """Historical daily price data (OHLCV)."""
    date: str = Field(..., json_schema_extra={"example": "2026-07-02"})
    open: float = Field(..., json_schema_extra={"example": 294.12})
    high: float = Field(..., json_schema_extra={"example": 309.42})
    low: float = Field(..., json_schema_extra={"example": 293.68})
    close: float = Field(..., json_schema_extra={"example": 308.63})
    volume: int = Field(..., json_schema_extra={"example": 75400626})


# ==========================================
# ENDPOINTS
# ==========================================

@router.get(
    "/{symbol}/price",
    response_model=StockPriceResponse,
    summary="Get current stock price",
    responses={
        200: {"description": "Current price data (cached 15 min)"},
        400: {"description": "Invalid stock symbol format"},
        503: {"description": "Alpha Vantage API rate limited or unavailable"},
    },
)
def get_stock_price(symbol: str) -> StockPriceResponse:
    """
    Get current stock price for a given symbol.
    
    - **symbol**: Stock ticker (1-5 letters, e.g., AAPL, GOOGL)
    
    Results are cached for 15 minutes to respect Alpha Vantage rate limits.
    """
    symbol = symbol.upper()
    
    if not (1 <= len(symbol) <= 5) or not symbol.isalpha():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid stock symbol."
        )
    
    price_data = alpha_vantage.get_stock_price(symbol)
    
    if not price_data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API rate limited or down."
        )
    
    return StockPriceResponse(**price_data)


@router.get(
    "/{symbol}/trends",
    response_model=MarketTrendsResponse,
    summary="Get market trend indicators",
    responses={
        200: {"description": "Trend data based on current price change"},
        400: {"description": "Invalid stock symbol format"},
        503: {"description": "Could not calculate trends"},
    },
)
def get_market_trends(symbol: str) -> MarketTrendsResponse:
    """
    Get simplified market trend indicators for a stock.
    
    - **symbol**: Stock ticker (1-5 letters)
    
    Returns 24h change percentage and trend direction (up/down/neutral)
    based on the most recent price change from Alpha Vantage.
    """
    symbol = symbol.upper()
    
    if not (1 <= len(symbol) <= 5) or not symbol.isalpha():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid stock symbol."
        )
    
    from app.services.market_trends import market_trends
    
    trends_data = market_trends.calculate_trends(symbol)
    
    if not trends_data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not calculate trends."
        )
    
    return MarketTrendsResponse(**trends_data)


@router.get(
    "/cache/stats",
    response_model=CacheStats,
    summary="Get cache performance stats",
)
def get_cache_stats() -> CacheStats:
    """
    Get in-memory cache statistics (hits, misses, hit rate).
    
    Useful for monitoring cache effectiveness and API call savings.
    """
    stats = cache.stats()
    return CacheStats(**stats)


@router.post(
    "/cache/clear",
    summary="Clear cache manually",
)
def clear_cache(symbol: str = None):
    """
    Manually clear cached data.
    
    - **symbol** (optional): Clear cache for specific symbol only.
      If omitted, clears entire cache.
    """
    cache.clear(symbol)
    return {"message": f"Cache cleared" + (f" for {symbol}" if symbol else "")}


@router.post(
    "/{symbol}/history/refresh",
    summary="Fetch and store price history",
    responses={
        200: {"description": "Price history fetched and stored"},
        400: {"description": "Invalid stock symbol format"},
        503: {"description": "Failed to fetch from Alpha Vantage"},
    },
)
def refresh_price_history(symbol: str):
    """
    Fetch daily price history from Alpha Vantage and store in database.
    
    - **symbol**: Stock ticker (1-5 letters)
    
    Fetches up to 100 days of daily OHLCV data. Call this before using
    the /history endpoint if data doesn't exist yet.
    """
    symbol = symbol.upper()
    
    if not (1 <= len(symbol) <= 5) or not symbol.isalpha():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid stock symbol."
        )
    
    from app.services.price_history import price_history_service
    
    success = price_history_service.fetch_and_store_history(symbol)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to fetch price history."
        )
    
    return {"message": f"Price history refreshed for {symbol}"}


@router.get(
    "/{symbol}/history",
    response_model=List[PriceHistoryResponse],
    summary="Get historical prices",
    responses={
        200: {"description": "List of daily OHLCV records"},
        400: {"description": "Invalid symbol or days parameter"},
        404: {"description": "No history found - call refresh endpoint first"},
    },
)
def get_price_history(symbol: str, days: int = 365):
    """
    Get historical daily prices for a symbol from the database.
    
    - **symbol**: Stock ticker (1-5 letters)
    - **days**: Lookback period - must be 1, 7, 30, or 365
    
    Data must be fetched first using POST /{symbol}/history/refresh.
    Results are cached for 4 hours.
    """
    symbol = symbol.upper()
    
    if not (1 <= len(symbol) <= 5) or not symbol.isalpha():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid stock symbol."
        )
    
    if days not in [1, 7, 30, 365]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Days must be 1, 7, 30, or 365."
        )
    
    from app.services.price_history import price_history_service
    
    prices = price_history_service.get_price_history(symbol, days)
    
    if not prices:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No price history for {symbol}. Try POST /stocks/{symbol}/history/refresh first."
        )
    
    return [PriceHistoryResponse(**p) for p in prices]
