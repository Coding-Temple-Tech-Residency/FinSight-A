from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.profile import get_or_create_settings, update_settings

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get(
    "",
    response_model=ProfileResponse,
    summary="Get current user profile and settings",
    description="Returns user identity plus preferences. Creates default settings on first call.",
)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    settings = get_or_create_settings(user_id=current_user.id, db=db)
    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        created_at=current_user.created_at,
        theme=settings.theme,
        is_day_trader=settings.is_day_trader,
        ai_refresh_interval_seconds=settings.ai_refresh_interval_seconds,
    )


@router.patch(
    "",
    response_model=ProfileResponse,
    summary="Update user settings",
    description="Partial update — only send the fields you want to change.",
)
def patch_profile(
    req: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    settings = update_settings(
        user_id=current_user.id,
        theme=req.theme,
        is_day_trader=req.is_day_trader,
        ai_refresh_interval_seconds=req.ai_refresh_interval_seconds,
        db=db,
    )
    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        created_at=current_user.created_at,
        theme=settings.theme,
        is_day_trader=settings.is_day_trader,
        ai_refresh_interval_seconds=settings.ai_refresh_interval_seconds,
    )
