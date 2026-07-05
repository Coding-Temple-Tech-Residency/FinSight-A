"""
Market data service for fetching stock prices from Alpha Vantage API.
"""
import requests
from typing import Optional, Dict, Any
from datetime import datetime
from app.core.config import get_settings
from app.services.cache import cache

settings = get_settings()


class AlphaVantageClient:
    """Alpha Vantage API client for stock market data."""
    
    BASE_URL = "https://www.alphavantage.co/query"
    
    def __init__(self):
        self.api_key = settings.alpha_vantage_api_key
        self.timeout = 10
    
    def get_stock_price(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Fetch current stock price for a symbol (with caching).
        
        Args:
            symbol: Stock symbol (e.g., 'AAPL')
            
        Returns:
            Dict with: symbol, price, timestamp, currency
            None if API call fails
        """
        # Check cache first
        cache_key = f"stock_price_{symbol.upper()}"
        cached_price = cache.get(cache_key)
        
        if cached_price:
            print(f"Cache hit for {symbol}")
            return cached_price
        
        print(f"Cache miss for {symbol}, fetching from API...")
        
        try:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": self.api_key,
            }
            
            response = requests.get(
                self.BASE_URL,
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Error handling
            if "Error Message" in data:
                print(f"API Error: {data['Error Message']}")
                return None
            
            if "Note" in data:  # Rate limit hit
                print(f"Rate limit: {data['Note']}")
                return None
            
            quote = data.get("Global Quote", {})
            
            if not quote:
                print(f"No data for symbol: {symbol}")
                return None
            
            price_data = {
                "symbol": quote.get("01. symbol", symbol),
                "price": float(quote.get("05. price", 0)),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "currency": "USD",
                "change": quote.get("09. change", "N/A"),
                "change_percent": quote.get("10. change percent", "N/A"),
            }
            
            # Store in cache (15min TTL)
            cache.set(cache_key, price_data, ttl_minutes=15)
            
            return price_data
        
        except requests.RequestException as e:
            print(f"Request error: {e}")
            return None
        except (ValueError, KeyError) as e:
            print(f"Data parsing error: {e}")
            return None


# Create singleton instance
alpha_vantage = AlphaVantageClient()
