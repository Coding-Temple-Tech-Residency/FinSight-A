"""
Portfolio domain models.

Tables:
- Portfolio: User's portfolio container
- Holding: Current stock position snapshot
- Transaction: Trade history log (immutable)

Key design: Transactions drive holdings. When buy/sell → holding auto-updates.
"""

from datetime import datetime
from decimal import Decimal
import uuid

from sqlalchemy import (
    Column, String, Numeric, DateTime, ForeignKey,
    Index, CheckConstraint, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Portfolio(Base):
    """User's portfolio (e.g., 'Retirement', 'Day Trading')."""
    __tablename__ = "portfolios"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan", lazy="select")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan", lazy="select")

    def __repr__(self) -> str:
        return f"<Portfolio(id={self.id}, user_id={self.user_id}, name='{self.name}')>"


class Holding(Base):
    """
    Current stock position snapshot.
    
    One row per (portfolio_id, symbol).
    Auto-updated by Transaction logic.
    """
    __tablename__ = "holdings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    portfolio_id = Column(String, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(10), nullable=False)
    quantity = Column(Numeric(precision=18, scale=4), nullable=False, default=0)
    avg_cost = Column(Numeric(precision=18, scale=6), nullable=True)
    added_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("portfolio_id", "symbol", name="uq_portfolio_symbol"),
        CheckConstraint("quantity >= 0", name="ck_quantity_non_negative"),
        Index("idx_portfolio_symbol", "portfolio_id", "symbol"),
    )

    portfolio = relationship("Portfolio", back_populates="holdings")

    def __repr__(self) -> str:
        return f"<Holding(portfolio_id={self.portfolio_id}, symbol='{self.symbol}', qty={self.quantity})>"


class Transaction(Base):
    """
    Trade history log (immutable, retained indefinitely).
    
    Every buy/sell creates a separate transaction row.
    Used to reconstruct holding history and calculate gains/losses.
    """
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    portfolio_id = Column(String, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(10), nullable=False)
    type = Column(String(10), nullable=False)
    quantity = Column(Numeric(precision=18, scale=4), nullable=False)
    price_at_trade = Column(Numeric(precision=18, scale=6), nullable=True)
    traded_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    __table_args__ = (
        CheckConstraint("type IN ('buy', 'sell')", name="ck_transaction_type"),
        CheckConstraint("quantity > 0", name="ck_quantity_positive"),
        Index("idx_portfolio_traded_at", "portfolio_id", "traded_at"),
    )

    portfolio = relationship("Portfolio", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, symbol='{self.symbol}', type='{self.type}', qty={self.quantity})>"