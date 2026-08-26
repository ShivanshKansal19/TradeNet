import logging
from typing import Dict, Any, List, Optional
import pandas as pd
from .base import AbstractMarketDataProvider

logger = logging.getLogger(__name__)

class YFinanceProvider(AbstractMarketDataProvider):
    """Yahoo Finance API adapter for Indian Equities (NSE)."""

    def _normalize_symbol(self, symbol: str) -> str:
        symbol = symbol.strip().upper()
        if symbol.startswith("^"):
            return symbol
        if not symbol.endswith(".NS") and not symbol.endswith(".BO"):
            return f"{symbol}.NS"
        return symbol

    def fetch_historical_ohlcv(
        self, symbol: str, period: str = "1y", interval: str = "1d"
    ) -> pd.DataFrame:
        import yfinance as yf

        ticker_sym = self._normalize_symbol(symbol)
        try:
            ticker = yf.Ticker(ticker_sym)
            df = ticker.history(period=period, interval=interval)
            if df.empty:
                logger.warning(f"No history returned for {ticker_sym}")
                return pd.DataFrame()
            
            # Normalize column names
            df = df.rename(columns={
                "Open": "open",
                "High": "high",
                "Low": "low",
                "Close": "close",
                "Volume": "volume",
                "Adj Close": "adjusted_close",
            })
            if "adjusted_close" not in df.columns and "close" in df.columns:
                df["adjusted_close"] = df["close"]
            return df
        except Exception as e:
            logger.error(f"Error fetching historical data for {ticker_sym}: {e}")
            return pd.DataFrame()

    def fetch_quote(self, symbol: str) -> Dict[str, Any]:
        import yfinance as yf

        ticker_sym = self._normalize_symbol(symbol)
        try:
            ticker = yf.Ticker(ticker_sym)
            info = ticker.fast_info
            
            last_price = getattr(info, "last_price", None) or getattr(info, "previous_close", None)
            prev_close = getattr(info, "previous_close", None) or last_price
            
            day_change = (last_price - prev_close) if last_price and prev_close else 0.0
            day_change_percent = (day_change / prev_close * 100) if prev_close else 0.0

            return {
                "symbol": symbol.replace(".NS", ""),
                "current_price": last_price,
                "day_change": day_change,
                "day_change_percent": day_change_percent,
                "market_cap": getattr(info, "market_cap", None),
                "week_52_high": getattr(info, "year_high", None),
                "week_52_low": getattr(info, "year_low", None),
            }
        except Exception as e:
            logger.error(f"Error fetching quote for {ticker_sym}: {e}")
            return {"symbol": symbol.replace(".NS", "")}

    def fetch_fundamentals(self, symbol: str) -> Dict[str, Any]:
        import yfinance as yf

        ticker_sym = self._normalize_symbol(symbol)
        try:
            ticker = yf.Ticker(ticker_sym)
            info = ticker.info
            return {
                "pe_ratio": info.get("trailingPE") or info.get("forwardPE"),
                "pb_ratio": info.get("priceToBook"),
                "eps": info.get("trailingEps"),
                "roe": info.get("returnOnEquity"),
                "debt_to_equity": info.get("debtToEquity"),
                "dividend_yield": info.get("dividendYield"),
                "book_value": info.get("bookValue"),
                "week_52_high": info.get("fiftyTwoWeekHigh"),
                "week_52_low": info.get("fiftyTwoWeekLow"),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "name": info.get("shortName") or info.get("longName") or symbol,
            }
        except Exception as e:
            logger.error(f"Error fetching fundamentals for {ticker_sym}: {e}")
            return {}

    def fetch_market_indices(self) -> List[Dict[str, Any]]:
        indices = [
            ("^NSEI", "NIFTY 50"),
            ("^NSEBANK", "NIFTY BANK"),
            ("^CNXIT", "NIFTY IT"),
        ]
        results = []
        for sym, name in indices:
            quote = self.fetch_quote(sym)
            results.append({
                "symbol": sym,
                "name": name,
                "value": quote.get("current_price", 0.0),
                "change": quote.get("day_change", 0.0),
                "change_percent": quote.get("day_change_percent", 0.0),
            })
        return results
