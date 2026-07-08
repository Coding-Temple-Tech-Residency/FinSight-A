from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.watchlist import WatchlistItemCreate, WatchlistItemResponse, WatchlistListResponse
from app.services import watchlist as watchlist_service

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.post(
    "",
    response_model=WatchlistItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add symbol to watchlist",
)
def add_to_watchlist(
    req: WatchlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WatchlistItemResponse:
    item = watchlist_service.add_item(user_id=current_user.id, symbol=req.symbol, db=db)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{req.symbol} is already on your watchlist",
        )
    return item


@router.get(
    "",
    response_model=WatchlistListResponse,
    summary="List watchlist items",
)
def list_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WatchlistListResponse:
    items = watchlist_service.list_items(user_id=current_user.id, db=db)
    return WatchlistListResponse(items=items, total=len(items))


@router.delete(
    "/{symbol}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove symbol from watchlist",
)
def remove_from_watchlist(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    removed = watchlist_service.remove_item(user_id=current_user.id, symbol=symbol, db=db)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{symbol.upper()} not found on your watchlist",
        )
