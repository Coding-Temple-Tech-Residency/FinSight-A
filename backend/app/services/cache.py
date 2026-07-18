"""
In-memory caching with TTL support.
"""
from typing import Optional, Any, Dict
from datetime import datetime, timedelta


class CacheEntry:
    """Single cache entry with TTL."""
    
    def __init__(self, value: Any, ttl_minutes: int = 15):
        self.value = value
        self.created_at = datetime.utcnow()
        self.ttl = timedelta(minutes=ttl_minutes)
    
    def is_expired(self) -> bool:
        """Check if entry has expired."""
        return datetime.utcnow() > (self.created_at + self.ttl)


class Cache:
    """Simple in-memory cache with TTL."""
    
    def __init__(self):
        self.store: Dict[str, CacheEntry] = {}
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired."""
        if key not in self.store:
            self.misses += 1
            return None
        
        entry = self.store[key]
        
        if entry.is_expired():
            del self.store[key]
            self.misses += 1
            return None
        
        self.hits += 1
        return entry.value
    
    def set(self, key: str, value: Any, ttl_minutes: int = 15):
        """Store value in cache with TTL."""
        self.store[key] = CacheEntry(value, ttl_minutes)
    
    def clear(self, key: str = None):
        """Clear cache (single key or all)."""
        if key:
            if key in self.store:
                del self.store[key]
        else:
            self.store.clear()
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        
        return {
            "hits": self.hits,
            "misses": self.misses,
            "total_requests": total,
            "hit_rate": f"{hit_rate:.2f}%",
            "cached_items": len(self.store),
        }


# Global cache instance
cache = Cache()
