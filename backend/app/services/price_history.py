"""
Price history service for storing and fetching historical stock data.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.price_history import PriceHistory
from app.services.cache import cache
from sqlalchemy import desc


class PriceHistoryService:
    """Manage historical price data."""
    
    def fetch_and_store_history(self, symbol: str) -> bool:
        """
        Fetch 1 year of daily OHLCV from yfinance and store in DB.
        Returns True if successful, False otherwise.
        """
        try:
            import yfinance as yf

            hist = yf.Ticker(symbol).history(period="1y")

            if hist.empty:
                print(f"No history data from yfinance for {symbol}")
                return False

            db = SessionLocal()
            try:
                for date_idx, row in hist.iterrows():
                    date_str = date_idx.strftime("%Y-%m-%d")
                    existing = db.query(PriceHistory).filter(
                        PriceHistory.symbol == symbol,
                        PriceHistory.date == date_str,
                    ).first()

                    if existing:
                        continue

                    db.add(PriceHistory(
                        symbol=symbol,
                        date=date_str,
                        open=float(row["Open"]),
                        high=float(row["High"]),
                        low=float(row["Low"]),
                        close=float(row["Close"]),
                        volume=int(row["Volume"]),
                    ))

                db.commit()
                print(f"Stored price history for {symbol} via yfinance")
                cache.clear(f"price_history_{symbol}")
                return True
            finally:
                db.close()

        except Exception as e:
            print(f"Error fetching price history via yfinance: {e}")
            return False
    
    def get_price_history(
        self,
        symbol: str,
        days: int = 365
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Get price history for symbol (past N days).
        
        Args:
            symbol: Stock symbol (e.g., 'AAPL')
            days: Number of days back (1, 7, 30, 365)
            
        Returns:
            List of price records or None if not found
        """
        try:
            cache_key = f"price_history_{symbol}_{days}d"
            cached = cache.get(cache_key)
            
            if cached:
                print(f"Cache hit for price history {symbol}")
                return cached
            
            db = SessionLocal()
            
            try:
                cutoff_date = (datetime.utcnow() - timedelta(days=days)).date()
                
                prices = db.query(PriceHistory).filter(
                    PriceHistory.symbol == symbol,
                    PriceHistory.date >= str(cutoff_date)
                ).order_by(desc(PriceHistory.date)).all()
                
                if not prices:
                    print(f"No price history for {symbol}")
                    return None
                
                result = [
                    {
                        "date": str(p.date),
                        "open": float(p.open),
                        "high": float(p.high),
                        "low": float(p.low),
                        "close": float(p.close),
                        "volume": p.volume,
                    }
                    for p in prices
                ]
                
                cache.set(cache_key, result, ttl_minutes=240)
                
                return result
            
            finally:
                db.close()
        
        except Exception as e:
            print(f"Error getting price history: {e}")
            return None


price_history_service = PriceHistoryService()
