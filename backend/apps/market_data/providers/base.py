from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import pandas as pd

class AbstractMarketDataProvider(ABC):
    """Abstract interface for stock and market data ingestion."""

    @abstractmethod
    def fetch_historical_ohlcv(
        self, symbol: str, period: str = "1y", interval: str = "1d"
    ) -> pd.DataFrame:
        """Fetch historical OHLCV data as a Pandas DataFrame with columns:
        ['Open', 'High', 'Low', 'Close', 'Volume', 'Adj Close'] indexed by Date.
        """
        pass

    @abstractmethod
    def fetch_quote(self, symbol: str) -> Dict[str, Any]:
        """Fetch real-time or latest snapshot quote for a symbol."""
        pass

    @abstractmethod
    def fetch_fundamentals(self, symbol: str) -> Dict[str, Any]:
        """Fetch key fundamental ratios and metrics."""
        pass

    @abstractmethod
    def fetch_market_indices(self) -> List[Dict[str, Any]]:
        """Fetch key market benchmark indices (e.g. NIFTY 50, NIFTY BANK)."""
        pass
