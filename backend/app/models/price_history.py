"""
Price history model for storing daily stock price data.
"""
from sqlalchemy import Column, String, Float, BigInteger, Date, Index
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid


class PriceHistory(Base):
    """Daily price data for stocks."""
    
    __tablename__ = "price_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False)
    open = Column(Float, nullable=True)
    high = Column(Float, nullable=True)
    low = Column(Float, nullable=True)
    close = Column(Float, nullable=True)
    volume = Column(BigInteger, nullable=True)
    
    __table_args__ = (
        Index('idx_symbol_date', 'symbol', 'date', unique=True),
    )
