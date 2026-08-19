from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseMarketDataProvider(ABC):
    """Abstract interface for Indian market data providers."""

    @abstractmethod
    def fetch_quote(self, symbol: str) -> Dict[str, Any]:
        """Fetch real-time or delayed quote for a single symbol."""
        pass

    @abstractmethod
    def fetch_history(self, symbol: str, period: str = '1y') -> List[Dict[str, Any]]:
        """Fetch historical daily OHLCV bars."""
        pass

    @abstractmethod
    def fetch_market_overview(self) -> Dict[str, Any]:
        """Fetch market indices, advances/declines, and top movers."""
        pass
