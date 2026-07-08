from sqlalchemy.orm import Session

from app.models.user_settings import UserSettings


def get_or_create_settings(user_id: str, db: Session) -> UserSettings:
    """Return existing settings or create with defaults."""
    settings = db.query(UserSettings).filter_by(user_id=user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(
    user_id: str,
    theme: str | None,
    is_day_trader: bool | None,
    ai_refresh_interval_seconds: int | None,
    db: Session,
) -> UserSettings:
    """Patch settings — only updates fields that are not None."""
    settings = get_or_create_settings(user_id, db)

    if theme is not None:
        settings.theme = theme
    if is_day_trader is not None:
        settings.is_day_trader = is_day_trader
    if ai_refresh_interval_seconds is not None:
        settings.ai_refresh_interval_seconds = ai_refresh_interval_seconds

    db.commit()
    db.refresh(settings)
    return settings
