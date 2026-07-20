"""
Portfolio domain Pydantic schemas.

Three types per model:
- Create: POST request (user input)
- Update: PATCH request (partial update)
- Response: API response (from database)
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# ==========================================
# PORTFOLIO SCHEMAS
# ==========================================

class PortfolioCreate(BaseModel):
    """Schema for creating a new portfolio."""
    name: str = Field(..., min_length=1, max_length=255, description="Portfolio name")
    description: Optional[str] = Field(None, max_length=500, description="Optional description")

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v or v.isspace():
            raise ValueError("Name cannot be empty or whitespace only")
        return v.strip()

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Retirement",
                "description": "Long-term investment fund"
            }
        }
    }


class PortfolioUpdate(BaseModel):
    """Schema for updating a portfolio (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if v is not None and (not v or v.isspace()):
            raise ValueError("Name cannot be empty or whitespace only")
        return v.strip() if v else None

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Updated Portfolio Name"
            }
        }
    }


class PortfolioResponse(BaseModel):
    """Schema for portfolio API response."""
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    holdings_count: Optional[int] = None

    model_config = {"from_attributes": True}


class PortfolioWithHoldings(PortfolioResponse):
    """Portfolio with nested holdings."""
    holdings: List["HoldingResponse"] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class PortfolioListResponse(BaseModel):
    """Response for list portfolios endpoint."""
    portfolios: List[PortfolioResponse]
    total: int


# ==========================================
# HOLDING SCHEMAS
# ==========================================

class HoldingCreate(BaseModel):
    """Schema for manually adding a holding."""
    symbol: str = Field(..., min_length=1, max_length=10, pattern="^[A-Za-z0-9.]+$", description="Stock ticker (letters, digits, and periods only)")
    quantity: Decimal = Field(..., gt=0, le=1_000_000_000, decimal_places=4, description="Number of shares (max 1 billion)")
    avg_cost: Optional[Decimal] = Field(None, gt=0, le=1_000_000, decimal_places=6, description="Average purchase price (max $1,000,000)")

    @field_validator("symbol")
    @classmethod
    def symbol_uppercase(cls, v):
        return v.upper().strip()

    model_config = {
        "json_schema_extra": {
            "example": {
                "symbol": "AAPL",
                "quantity": 100.5,
                "avg_cost": 150.25
            }
        }
    }


class HoldingUpdate(BaseModel):
    """Schema for updating a holding (all fields optional)."""
    quantity: Optional[Decimal] = Field(None, ge=0, decimal_places=4)
    avg_cost: Optional[Decimal] = Field(None, gt=0, le=1_000_000, decimal_places=6)

    model_config = {
        "json_schema_extra": {
            "example": {
                "quantity": 105.5
            }
        }
    }


class HoldingResponse(BaseModel):
    """Schema for holding API response."""
    id: UUID
    portfolio_id: UUID
    symbol: str
    quantity: Decimal
    avg_cost: Optional[Decimal]
    added_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HoldingListResponse(BaseModel):
    """Response for list holdings endpoint."""
    holdings: List[HoldingResponse]
    total: int


# ==========================================
# TRANSACTION SCHEMAS
# ==========================================

class TransactionCreate(BaseModel):
    """Schema for creating a transaction (buy/sell)."""
    symbol: str = Field(..., min_length=1, max_length=10, pattern="^[A-Za-z0-9.]+$", description="Stock ticker (letters, digits, and periods only)")
    type: str = Field(..., pattern="^(?i)(buy|sell)$", description="Transaction type: 'buy' or 'sell' (case-insensitive)")
    quantity: Decimal = Field(..., gt=0, le=1_000_000_000, decimal_places=4, description="Number of shares (always positive, max 1 billion)")
    price_at_trade: Optional[Decimal] = Field(None, gt=0, le=1_000_000, decimal_places=6, description="Price per share (max $1,000,000)")

    @field_validator("symbol")
    @classmethod
    def symbol_uppercase(cls, v):
        return v.upper().strip()

    @field_validator("type")
    @classmethod
    def type_lowercase(cls, v):
        return v.lower().strip()

    model_config = {
        "json_schema_extra": {
            "example": {
                "symbol": "AAPL",
                "type": "buy",
                "quantity": 50.5,
                "price_at_trade": 150.25
            }
        }
    }


class TransactionResponse(BaseModel):
    """Schema for transaction API response."""
    id: UUID
    portfolio_id: UUID
    symbol: str
    type: str
    quantity: Decimal
    price_at_trade: Optional[Decimal]
    traded_at: datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    """Response for list transactions endpoint (with pagination)."""
    transactions: List[TransactionResponse]
    total: int
    page: int
    limit: int


# ==========================================
# ERROR RESPONSE
# ==========================================

class ErrorResponse(BaseModel):
    """Standard error response format."""
    detail: str
    status_code: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
