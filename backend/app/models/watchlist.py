import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint

from app.core.database import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(10), nullable=False)
    added_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "symbol", name="uq_watchlist_user_symbol"),
    )

    def __repr__(self) -> str:
        return f"<WatchlistItem(user_id={self.user_id}, symbol='{self.symbol}')>"
