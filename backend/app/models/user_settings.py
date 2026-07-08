import uuid
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, UniqueConstraint

from app.core.database import Base


class UserSettings(Base):
    """One-to-one user preferences table. Created on first GET /profile."""

    __tablename__ = "user_settings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    theme = Column(String(16), nullable=False, default="system")
    is_day_trader = Column(Boolean, nullable=False, default=False)
    ai_refresh_interval_seconds = Column(Integer, nullable=False, default=300)

    __table_args__ = (
        UniqueConstraint("user_id", name="uq_user_settings_user_id"),
    )

    def __repr__(self) -> str:
        return f"<UserSettings(user_id={self.user_id}, theme='{self.theme}')>"
