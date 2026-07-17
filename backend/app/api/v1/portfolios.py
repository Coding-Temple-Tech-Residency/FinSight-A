"""
Portfolio domain FastAPI routes.

13 endpoints for CRUD operations:
- Portfolio: 5 endpoints
- Holding: 4 endpoints
- Transaction: 4 endpoints

All routes require JWT authentication and verify user ownership.
"""

from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.models.user import User
from app.core.database import SessionLocal
from app.models.portfolio import Portfolio, Holding, Transaction
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioUpdate,
    PortfolioResponse,
    PortfolioWithHoldings,
    PortfolioListResponse,
    HoldingCreate,
    HoldingUpdate,
    HoldingResponse,
    HoldingListResponse,
    TransactionCreate,
    TransactionResponse,
    TransactionListResponse,
    ErrorResponse,
)

router = APIRouter(
    prefix="/portfolios",
    tags=["portfolios"],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        404: {"model": ErrorResponse, "description": "Not found"},
    }
)


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================
# PORTFOLIO ENDPOINTS
# ==========================================

@router.post(
    "",
    response_model=PortfolioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create portfolio",
)
async def create_portfolio(
    req: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new portfolio."""
    try:
        portfolio = Portfolio(
            user_id=current_user.id,
            name=req.name,
            description=req.description
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        return PortfolioResponse.from_orm(portfolio)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "",
    response_model=PortfolioListResponse,
    summary="List user portfolios",
)
async def list_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all portfolios for authenticated user."""
    try:
        portfolios = db.query(Portfolio).filter_by(user_id=current_user.id).all()
        portfolio_responses = []
        for p in portfolios:
            response = PortfolioResponse.from_orm(p)
            response.holdings_count = len(p.holdings) if p.holdings else 0
            portfolio_responses.append(response)
        return PortfolioListResponse(portfolios=portfolio_responses, total=len(portfolio_responses))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/{portfolio_id}",
    response_model=PortfolioWithHoldings,
    summary="Get portfolio with holdings",
)
async def get_portfolio(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get portfolio with all holdings."""
    try:
        portfolio = db.query(Portfolio).filter_by(
            id=str(portfolio_id),
            user_id=current_user.id
        ).first()
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        response = PortfolioWithHoldings.from_orm(portfolio)
        response.holdings = [HoldingResponse.from_orm(h) for h in portfolio.holdings]
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch(
    "/{portfolio_id}",
    response_model=PortfolioResponse,
    summary="Update portfolio",
)
async def update_portfolio(
    portfolio_id: UUID,
    req: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update portfolio name or description."""
    try:
        portfolio = db.query(Portfolio).filter_by(
            id=str(portfolio_id),
            user_id=current_user.id
        ).first()
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        if req.name is not None:
            portfolio.name = req.name
        if req.description is not None:
            portfolio.description = req.description
        
        db.commit()
        db.refresh(portfolio)
        return PortfolioResponse.from_orm(portfolio)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/{portfolio_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete portfolio",
)
async def delete_portfolio(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete portfolio and all its holdings/transactions."""
    try:
        portfolio = db.query(Portfolio).filter_by(
            id=str(portfolio_id),
            user_id=current_user.id
        ).first()
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        db.delete(portfolio)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# HOLDING ENDPOINTS
# ==========================================

@router.post(
    "/{portfolio_id}/holdings",
    response_model=HoldingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add holding to portfolio",
)
async def create_holding(
    portfolio_id: UUID,
    req: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Manually add a holding to portfolio."""
    try:
        portfolio = db.query(Portfolio).filter_by(
            id=str(portfolio_id),
            user_id=current_user.id
        ).first()
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        existing = db.query(Holding).filter_by(
            portfolio_id=str(portfolio_id),
            symbol=req.symbol
        ).first()
        
        if existing:
            raise HTTPException(status_code=409, detail=f"Holding for {req.symbol} already exists")
        
        holding = Holding(
            portfolio_id=str(portfolio_id),
            symbol=req.symbol,
            quantity=req.quantity,
            avg_cost=req.avg_cost
        )
        db.add(holding)
        db.commit()
        db.refresh(holding)
        return HoldingResponse.from_orm(holding)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/{portfolio_id}/holdings",
    response_model=HoldingListResponse,
    summary="List portfolio holdings",
)
async def list_holdings(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all holdings in portfolio."""
    print("=== LIST HOLDINGS HIT ===")
    print("portfolio_id:", portfolio_id)
    print("portfolio_id type:", type(portfolio_id))
    print("current_user.id:", current_user.id)
    print("current_user.id type:", type(current_user.id))

    try:
        portfolio = db.query(Portfolio).filter_by(
            id=str(portfolio_id),
            user_id=current_user.id
        ).first()
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        holdings = db.query(Holding).filter_by(portfolio_id=str(portfolio_id)).all()
        return HoldingListResponse(
            holdings=[HoldingResponse.from_orm(h) for h in holdings],
            total=len(holdings)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch(
    "/{portfolio_id}/holdings/{holding_id}",
    response_model=HoldingResponse,
    summary="Update holding",
)
async def update_holding(
    portfolio_id: UUID,
    holding_id: UUID,
    req: HoldingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    
    print()
    print("===== UPDATE HOLDING =====")
    print(f"portfolio_id: {portfolio_id}")
    print(f"holding_id: {holding_id}")
    print(f"user id: {current_user.id}")
    print()
    """Update holding quantity or average cost."""
    try:
        portfolio = db.query(Portfolio).filter_by(
            id=str(portfolio_id),
            user_id=current_user.id
        ).first()

        print(portfolio)
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        holding = db.query(Holding).filter_by(
            id=str(holding_id),
            portfolio_id=str(portfolio_id)
        ).first()

        print(holding)
        
        if not holding:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        if req.quantity is not None:
            holding.quantity = req.quantity
        if req.avg_cost is not None:
            holding.avg_cost = req.avg_cost
        
        db.commit()
        db.refresh(holding)
        return HoldingResponse.from_orm(holding)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/{portfolio_id}/holdings/{holding_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete holding",
)
async def delete_holding(
    portfolio_id: UUID,
    holding_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a holding from portfolio."""
    try:
        portfolio = db.query(Portfolio).filter_by(
            id=str(portfolio_id),
            user_id=current_user.id
        ).first()
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        holding = db.query(Holding).filter_by(
            id=str(holding_id),
            portfolio_id=str(portfolio_id)
        ).first()
        
        if not holding:
            raise HTTPException(status_code=404, detail="Holding not found")
        
        db.delete(holding)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# TRANSACTION ENDPOINTS
# ==========================================

@router.post(
    "/{portfolio_id}/transactions",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record transaction (buy/sell)",
)
async def create_transaction(
    portfolio_id: UUID,
    req: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Record a transaction (buy/sell).
    
    NOTE: Holding auto-update logic should be in service.py
    """
    try:
        portfolio = db.query(Portfolio).filter_by(
            id=str(portfolio_id),
            user_id=current_user.id
        ).first()
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        transaction = Transaction(
            portfolio_id=str(portfolio_id),
            symbol=req.symbol,
            type=req.type,
            quantity=req.quantity,
            price_at_trade=req.price_at_trade
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return TransactionResponse.from_orm(transaction)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/{portfolio_id}/transactions",
    response_model=TransactionListResponse,
    summary="List portfolio transactions",
)
async def list_transactions(
    portfolio_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List transactions with pagination."""
    try:
        portfolio = db.query(Portfolio).filter_by(
            id=str(portfolio_id),
            user_id=current_user.id
        ).first()
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        offset = (page - 1) * limit
        total = db.query(Transaction).filter_by(portfolio_id=str(portfolio_id)).count()
        
        transactions = db.query(Transaction).filter_by(
            portfolio_id=str(portfolio_id)
        ).order_by(Transaction.traded_at.desc()).offset(offset).limit(limit).all()
        
        return TransactionListResponse(
            transactions=[TransactionResponse.from_orm(t) for t in transactions],
            total=total,
            page=page,
            limit=limit
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))