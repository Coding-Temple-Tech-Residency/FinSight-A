"""
Stock market data endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.market_data import alpha_vantage
from app.services.cache import cache

router = APIRouter(prefix="/stocks", tags=["stocks"])


# ==========================================
# RESPONSE MODELS
# ==========================================

class StockPriceResponse(BaseModel):
    symbol: str
    price: float
    timestamp: str
    currency: str
    change: str
    change_percent: str


class CacheStats(BaseModel):
    hits: int
    misses: int
    total_requests: int
    hit_rate: str
    cached_items: int


class MarketTrendsResponse(BaseModel):
    symbol: str
    current_price: float
    change_24h: float
    trend_7d: str
    trend_30d: str
    data_points: int
    note: str = None


class PriceHistoryResponse(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


# ==========================================
# ENDPOINTS
# ==========================================

@router.get("/{symbol}/price", response_model=StockPriceResponse)
def get_stock_price(symbol: str) -> StockPriceResponse:
    """Get current stock price (cached 15 min)."""
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


@router.get("/{symbol}/trends", response_model=MarketTrendsResponse)
def get_market_trends(symbol: str) -> MarketTrendsResponse:
    """Get market trends (24h change + simple trend)."""
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


@router.get("/cache/stats", response_model=CacheStats)
def get_cache_stats() -> CacheStats:
    """Get cache statistics."""
    stats = cache.stats()
    return CacheStats(**stats)


@router.post("/cache/clear")
def clear_cache(symbol: str = None):
    """Clear cache (single symbol or all)."""
    cache.clear(symbol)
    return {"message": f"Cache cleared" + (f" for {symbol}" if symbol else "")}


@router.post("/{symbol}/history/refresh")
def refresh_price_history(symbol: str):
    """
    Fetch and store price history from Alpha Vantage.
    
    Example: POST /api/v1/stocks/AAPL/history/refresh
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


@router.get("/{symbol}/history", response_model=List[PriceHistoryResponse])
def get_price_history(symbol: str, days: int = 365):
    """
    Get historical prices for a symbol.
    
    Example: GET /api/v1/stocks/AAPL/history?days=30
    
    Valid days: 1, 7, 30, 365
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
