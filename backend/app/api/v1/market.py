from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.market import TopMoversResponse, QuoteResponse, MoverItem
from app.services.market import get_top_movers, get_quote

router = APIRouter(prefix="/market", tags=["market"])


@router.get(
    "/trends",
    response_model=TopMoversResponse,
    summary="Get top market movers",
    description=(
        "Returns top gainers and losers from Alpha Vantage. "
        "Results are cached for 60 seconds. Returns empty lists if the API key is missing or rate-limited."
    ),
)
def market_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TopMoversResponse:
    data = get_top_movers()
    return TopMoversResponse(
        top_gainers=[MoverItem(**item) for item in data["top_gainers"]],
        top_losers=[MoverItem(**item) for item in data["top_losers"]],
    )


@router.get(
    "/quote/{symbol}",
    response_model=QuoteResponse,
    summary="Get real-time quote for a symbol",
    description=(
        "Returns a live quote from Alpha Vantage. "
        "Cached per symbol for 60 seconds. Returns 404 if the symbol is invalid or the API is unavailable."
    ),
)
def market_quote(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QuoteResponse:
    data = get_quote(symbol)
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quote unavailable for {symbol.upper()} — check the symbol or try again later",
        )
    return QuoteResponse(**data)
