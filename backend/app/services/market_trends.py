"""
Market trends calculation service (simplified).
"""
from typing import Optional, Dict, Any
from app.services.market_data import alpha_vantage


class MarketTrendsCalculator:
    """Calculate market trends from current price data."""
    
    def calculate_trends(self, symbol: str) -> Optional[Dict[str, Any]]:
        """
        Calculate market trends using current price.
        
        Note: For full 30-day trends, use yfinance fallback
        or fetch historical data separately.
        """
        try:
            # Get current price (cached)
            current_data = alpha_vantage.get_stock_price(symbol)
            if not current_data:
                return None
            
            current_price = current_data["price"]
            
            # Extract 24h change from API response
            change_24h = float(
                current_data.get("change", "0").replace("%", "")
            )
            
            # Determine trend based on current change
            trend_7d = "up" if change_24h > 0 else ("down" if change_24h < 0 else "neutral")
            trend_30d = trend_7d  # Same as 7d for MVP
            
            return {
                "symbol": symbol,
                "current_price": current_price,
                "change_24h": round(change_24h, 2),
                "trend_7d": trend_7d,
                "trend_30d": trend_30d,
                "data_points": 1,  # Only current price for MVP
                "note": "Full 30-day data requires yfinance fallback"
            }
        
        except Exception as e:
            print(f"Error calculating trends: {e}")
            return None


# Singleton instance
market_trends = MarketTrendsCalculator()
