"""
Pydantic schemas for the portfolio performance endpoint.
"""
from typing import List, Literal
from pydantic import BaseModel


class PerformancePoint(BaseModel):
    date: str
    value: float


class PerformanceSummary(BaseModel):
    start_value: float
    end_value: float
    change_abs: float
    change_pct: float


class PortfolioPerformanceResponse(BaseModel):
    portfolio_id: str
    range: str
    basis: Literal["reconstructed", "current_holdings_fallback"]
    disclaimer: str
    summary: PerformanceSummary
    series: List[PerformancePoint]
