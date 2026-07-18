"""
Seed database with mock data for development/testing.

Creates:
- 1 test user (if not exists)
- 1 portfolio
- 5 holdings (AAPL, GOOGL, MSFT, AMZN, TSLA)
- 10 random transactions

Usage:
    python3 scripts/seed_database.py
    python3 scripts/seed_database.py --reset  # Clear existing data first
"""

import sys
import os
import argparse
from decimal import Decimal
from datetime import datetime, timedelta

# Add project root to path (relative, not hardcoded)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from faker import Faker
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.portfolio import Portfolio, Holding, Transaction

fake = Faker()

TEST_USER_EMAIL = "seed-test@finsight.dev"
TEST_USER_PASSWORD = "SeedTest123"


def get_or_create_test_user(db: Session) -> User:
    """Get existing test user or create one."""
    user = db.query(User).filter_by(email=TEST_USER_EMAIL).first()
    
    if user:
        print(f"✅ Using existing test user: {user.id}")
        return user
    
    user = User(
        email=TEST_USER_EMAIL,
        password_hash=hash_password(TEST_USER_PASSWORD),
        is_active=True,
    )
    db.add(user)
    db.flush()
    print(f"✅ Test user created: {user.id}")
    return user


def clear_existing_data(db: Session, user_id: str):
    """Remove existing seed data for clean re-seed."""
    portfolios = db.query(Portfolio).filter_by(user_id=user_id).all()
    for p in portfolios:
        db.delete(p)  # CASCADE deletes holdings + transactions
    db.commit()
    print(f"🗑️  Cleared {len(portfolios)} existing portfolio(s)")


def seed_database(reset: bool = False):
    """Generate and insert mock data."""
    db = SessionLocal()
    
    try:
        print("🔄 Seeding database...")
        
        user = get_or_create_test_user(db)
        db.commit()
        
        if reset:
            clear_existing_data(db, user.id)
        
        # Create portfolio
        portfolio = Portfolio(
            user_id=user.id,
            name="Mock Portfolio",
            description="Auto-generated test portfolio"
        )
        db.add(portfolio)
        db.flush()
        print(f"✅ Portfolio created: {portfolio.id}")
        
        # Create holdings
        stocks = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]
        holdings_list = []
        
        for stock in stocks:
            quantity = Decimal(fake.random_int(min=10, max=1000)) / Decimal(10)
            avg_cost = Decimal(fake.random_int(min=100, max=500))
            
            holding = Holding(
                portfolio_id=portfolio.id,
                symbol=stock,
                quantity=quantity,
                avg_cost=avg_cost
            )
            db.add(holding)
            holdings_list.append(holding)
        
        db.flush()
        print(f"✅ {len(holdings_list)} holdings created")
        
        # Create transactions
        for i in range(10):
            stock = fake.random_element(stocks)
            trans_type = fake.random_element(["buy", "sell"])
            quantity = Decimal(fake.random_int(min=5, max=100)) / Decimal(10)
            price = Decimal(fake.random_int(min=100, max=500))
            
            days_ago = fake.random_int(min=0, max=30)
            traded_at = datetime.utcnow() - timedelta(days=days_ago)
            
            transaction = Transaction(
                portfolio_id=portfolio.id,
                symbol=stock,
                type=trans_type,
                quantity=quantity,
                price_at_trade=price,
                traded_at=traded_at
            )
            db.add(transaction)
        
        db.commit()
        print(f"✅ 10 transactions created")
        print("\n🎉 Database seeding complete!")
        print(f"User: {TEST_USER_EMAIL} / {TEST_USER_PASSWORD}")
        print(f"Portfolio ID: {portfolio.id}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed database with mock data")
    parser.add_argument("--reset", action="store_true", help="Clear existing seed data first")
    args = parser.parse_args()
    
    seed_database(reset=args.reset)
