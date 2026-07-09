from typing import List, Optional
from pydantic import BaseModel


class MoverItem(BaseModel):
    ticker: str
    price: Optional[str] = None
    change_amount: Optional[str] = None
    change_percentage: Optional[str] = None
    volume: Optional[str] = None


class TopMoversResponse(BaseModel):
    top_gainers: List[MoverItem]
    top_losers: List[MoverItem]


class QuoteResponse(BaseModel):
    symbol: str
    price: Optional[str] = None
    change: Optional[str] = None
    change_percent: Optional[str] = None
    volume: Optional[str] = None
    latest_trading_day: Optional[str] = None
