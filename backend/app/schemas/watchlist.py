from datetime import datetime
from typing import List

from pydantic import BaseModel, Field, validator


class WatchlistItemCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10, description="Stock ticker symbol")

    @validator("symbol")
    def symbol_uppercase(cls, v):
        return v.upper().strip()

    model_config = {
        "json_schema_extra": {"example": {"symbol": "AAPL"}}
    }


class WatchlistItemResponse(BaseModel):
    id: str
    user_id: str
    symbol: str
    added_at: datetime

    model_config = {"from_attributes": True}


class WatchlistListResponse(BaseModel):
    items: List[WatchlistItemResponse]
    total: int
