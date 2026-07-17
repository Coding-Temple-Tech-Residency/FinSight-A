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
        Fetch daily prices from Alpha Vantage and store in DB.
        Returns True if successful, False otherwise.
        """
        try:
            import requests
            from app.core.config import get_settings
            
            settings = get_settings()
            
            params = {
                "function": "TIME_SERIES_DAILY",
                "symbol": symbol,
                "apikey": settings.alpha_vantage_api_key,
            }
            
            response = requests.get(
                "https://www.alphavantage.co/query",
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if "Error Message" in data or "Note" in data:
                print(f"API Error for {symbol}")
                return False
            
            time_series = data.get("Time Series (Daily)", {})
            
            if not time_series:
                print(f"No time series data for {symbol}")
                return False
            
            db = SessionLocal()
            
            try:
                for date_str, daily_data in time_series.items():
                    existing = db.query(PriceHistory).filter(
                        PriceHistory.symbol == symbol,
                        PriceHistory.date == date_str
                    ).first()
                    
                    if existing:
                        continue
                    
                    price_entry = PriceHistory(
                        symbol=symbol,
                        date=date_str,
                        open=float(daily_data.get("1. open", 0)),
                        high=float(daily_data.get("2. high", 0)),
                        low=float(daily_data.get("3. low", 0)),
                        close=float(daily_data.get("4. close", 0)),
                        volume=int(daily_data.get("5. volume", 0)),
                    )
                    db.add(price_entry)
                
                db.commit()
                print(f"Stored {len(time_series)} price records for {symbol}")
                
                cache.clear(f"price_history_{symbol}")
                
                return True
            
            finally:
                db.close()
        
        except Exception as e:
            print(f"Error fetching price history: {e}")
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
