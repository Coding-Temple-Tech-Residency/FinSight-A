from decimal import Decimal
from typing import Any, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.market import MoverItem
from app.services.market import get_top_movers
from app.services.portfolio import get_user_portfolios

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class UserProfile(BaseModel):
    id: str
    email: str
    username: Optional[str] = None


class PortfolioSummary(BaseModel):
    count: int
    total_value: Decimal


class DashboardResponse(BaseModel):
    user_profile: UserProfile
    portfolio_summary: PortfolioSummary
    watchlist_preview: List[Any]
    recent_market_trends: List[MoverItem]


@router.get(
    "",
    response_model=DashboardResponse,
    summary="Get dashboard data",
    description=(
        "Returns aggregated dashboard data for the authenticated user: "
        "user profile, portfolio summary, watchlist preview, and recent market trends."
    ),
)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    portfolios = get_user_portfolios(user_id=current_user.id, db=db)

    total_value = sum(
        (h.quantity * h.avg_cost for p in portfolios for h in p.holdings if h.avg_cost is not None),
        Decimal(0),
    )

    return DashboardResponse(
        user_profile=UserProfile(
            id=current_user.id,
            email=current_user.email,
        ),
        portfolio_summary=PortfolioSummary(
            count=len(portfolios),
            total_value=total_value,
        ),
        watchlist_preview=[],
        recent_market_trends=[
            MoverItem(**m) for m in get_top_movers()["top_gainers"][:5]
        ],
    )
