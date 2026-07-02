"""
Portfolio service layer (business logic).

Handles:
- Portfolio CRUD
- Holding CRUD
- Transaction creation + auto-update holding
"""

from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio, Holding, Transaction


# ==========================================
# PORTFOLIO SERVICE
# ==========================================

def create_portfolio(user_id: str, name: str, description: str = None, db: Session = None) -> Portfolio:
    """Create a new portfolio."""
    portfolio = Portfolio(
        user_id=user_id,
        name=name,
        description=description
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


def get_user_portfolios(user_id: str, db: Session) -> list:
    """Get all portfolios for a user."""
    return db.query(Portfolio).filter_by(user_id=user_id).all()


def get_portfolio(portfolio_id: str, user_id: str, db: Session) -> Portfolio:
    """Get portfolio (with ownership check)."""
    return db.query(Portfolio).filter_by(
        id=portfolio_id,
        user_id=user_id
    ).first()


def update_portfolio(portfolio_id: str, user_id: str, name: str = None, description: str = None, db: Session = None) -> Portfolio:
    """Update portfolio."""
    portfolio = get_portfolio(portfolio_id, user_id, db)
    if not portfolio:
        return None
    
    if name:
        portfolio.name = name
    if description is not None:
        portfolio.description = description
    
    db.commit()
    db.refresh(portfolio)
    return portfolio


def delete_portfolio(portfolio_id: str, user_id: str, db: Session) -> bool:
    """Delete portfolio (CASCADE deletes holdings/transactions)."""
    portfolio = get_portfolio(portfolio_id, user_id, db)
    if not portfolio:
        return False
    
    db.delete(portfolio)
    db.commit()
    return True


# ==========================================
# HOLDING SERVICE
# ==========================================

def create_holding(portfolio_id: str, symbol: str, quantity: Decimal, avg_cost: Decimal = None, db: Session = None) -> Holding:
    """Create a new holding."""
    holding = Holding(
        portfolio_id=portfolio_id,
        symbol=symbol,
        quantity=quantity,
        avg_cost=avg_cost
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


def get_holding(holding_id: str, portfolio_id: str, db: Session) -> Holding:
    """Get holding by id (with portfolio check)."""
    return db.query(Holding).filter_by(
        id=holding_id,
        portfolio_id=portfolio_id
    ).first()


def get_or_create_holding(portfolio_id: str, symbol: str, db: Session) -> Holding:
    """Get existing holding or create new one."""
    holding = db.query(Holding).filter_by(
        portfolio_id=portfolio_id,
        symbol=symbol
    ).first()
    
    if not holding:
        holding = Holding(
            portfolio_id=portfolio_id,
            symbol=symbol,
            quantity=Decimal(0)
        )
        db.add(holding)
        db.flush()
    
    return holding


def update_holding(holding_id: str, portfolio_id: str, quantity: Decimal = None, avg_cost: Decimal = None, db: Session = None) -> Holding:
    """Update holding."""
    holding = get_holding(holding_id, portfolio_id, db)
    if not holding:
        return None
    
    if quantity is not None:
        holding.quantity = quantity
    if avg_cost is not None:
        holding.avg_cost = avg_cost
    
    db.commit()
    db.refresh(holding)
    return holding


def delete_holding(holding_id: str, portfolio_id: str, db: Session) -> bool:
    """Delete holding."""
    holding = get_holding(holding_id, portfolio_id, db)
    if not holding:
        return False
    
    db.delete(holding)
    db.commit()
    return True


# ==========================================
# TRANSACTION SERVICE
# ==========================================

def create_transaction(
    portfolio_id: str,
    symbol: str,
    trans_type: str,
    quantity: Decimal,
    price_at_trade: Decimal = None,
    db: Session = None
) -> Transaction:
    """
    Create transaction + auto-update holding.
    
    Buy: increase quantity, recalculate avg_cost
    Sell: decrease quantity, keep avg_cost same
    """
    # 1. Create transaction record
    transaction = Transaction(
        portfolio_id=portfolio_id,
        symbol=symbol,
        type=trans_type,
        quantity=quantity,
        price_at_trade=price_at_trade
    )
    db.add(transaction)
    db.flush()
    
    # 2. Auto-update holding
    holding = get_or_create_holding(portfolio_id, symbol, db)
    
    if trans_type == "buy":
        # Recalculate avg_cost (weighted average)
        if holding.avg_cost is None or holding.quantity == 0:
            # First buy or no previous quantity
            holding.avg_cost = price_at_trade
            holding.quantity = quantity
        else:
            # Weighted average: (old_qty * old_cost + new_qty * new_cost) / total_qty
            old_total_cost = holding.quantity * holding.avg_cost
            new_total_cost = quantity * price_at_trade
            holding.quantity += quantity
            holding.avg_cost = (old_total_cost + new_total_cost) / holding.quantity
    
    elif trans_type == "sell":
        # Just reduce quantity, avg_cost stays same
        holding.quantity -= quantity
        
        # Delete holding if quantity becomes 0
        if holding.quantity <= 0:
            db.delete(holding)
    
    db.commit()
    db.refresh(transaction)
    return transaction


def get_transactions(portfolio_id: str, db: Session, page: int = 1, limit: int = 50) -> tuple:
    """Get transactions with pagination."""
    offset = (page - 1) * limit
    
    total = db.query(Transaction).filter_by(portfolio_id=portfolio_id).count()
    transactions = db.query(Transaction).filter_by(
        portfolio_id=portfolio_id
    ).order_by(Transaction.traded_at.desc()).offset(offset).limit(limit).all()
    
    return transactions, total