from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.watchlist import WatchlistItem


def add_item(user_id: str, symbol: str, db: Session) -> WatchlistItem | None:
    """Add symbol to watchlist. Returns None if symbol already exists for this user."""
    item = WatchlistItem(user_id=user_id, symbol=symbol.upper())
    db.add(item)
    try:
        db.commit()
        db.refresh(item)
        return item
    except IntegrityError:
        db.rollback()
        return None


def list_items(user_id: str, db: Session) -> list[WatchlistItem]:
    """Return all watchlist items for a user, oldest first."""
    return (
        db.query(WatchlistItem)
        .filter_by(user_id=user_id)
        .order_by(WatchlistItem.added_at.asc())
        .all()
    )


def remove_item(user_id: str, symbol: str, db: Session) -> bool:
    """Remove symbol from watchlist. Returns False if it didn't exist."""
    item = db.query(WatchlistItem).filter_by(user_id=user_id, symbol=symbol.upper()).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True
