"""
Generate mock portfolio data for testing.

Creates:
- 1 portfolio per test user
- 5 holdings per portfolio
- 10 transactions per portfolio
"""

from decimal import Decimal
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/Users/sy/FinSight-A/backend')

from faker import Faker
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
# Import ALL models so SQLAlchemy knows about relationships
from app.models.user import User
from app.models.portfolio import Portfolio, Holding, Transaction

fake = Faker()


def generate_mock_data():
    """Generate and insert mock data."""
    db = SessionLocal()
    
    try:
        # Test user ID (from earlier auth test)
        test_user_id = "ea3d2ef8-7e27-406e-8c77-31ee988cca31"
        
        print("🔄 Generating mock data...")
        
        # 1. Create portfolio
        portfolio = Portfolio(
            user_id=test_user_id,
            name="Mock Portfolio",
            description="Auto-generated test portfolio"
        )
        db.add(portfolio)
        db.flush()
        print(f"✅ Portfolio created: {portfolio.id}")
        
        # 2. Create 5 holdings with random stocks
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
        
        # 3. Create 10 transactions
        for i in range(10):
            stock = fake.random_element(stocks)
            trans_type = fake.random_element(["buy", "sell"])
            quantity = Decimal(fake.random_int(min=5, max=100)) / Decimal(10)
            price = Decimal(fake.random_int(min=100, max=500))
            
            # Transaction date (past 30 days)
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
        print("\n🎉 Mock data generation complete!")
        print(f"Portfolio ID: {portfolio.id}")
        print(f"User ID: {test_user_id}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    generate_mock_data()
