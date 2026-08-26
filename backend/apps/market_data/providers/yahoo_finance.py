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
            
            # 1. Try fast_info
            info = ticker.fast_info
            last_price = getattr(info, "last_price", None)
            prev_close = getattr(info, "previous_close", None)
            volume = getattr(info, "last_volume", None) or getattr(info, "volume", None)

            # 2. If missing or 0, fallback to recent historical candles (especially accurate for indices)
            if not last_price or last_price == 0:
                try:
                    df = ticker.history(period="5d", interval="1d")
                    if not df.empty:
                        last_price = float(df["Close"].iloc[-1])
                        if len(df) >= 2:
                            prev_close = float(df["Close"].iloc[-2])
                        if "Volume" in df.columns:
                            volume = int(df["Volume"].iloc[-1])
                except Exception:
                    pass

            # 3. Fallback to ticker.info dictionary
            if not last_price:
                t_info = ticker.info or {}
                last_price = t_info.get("regularMarketPrice") or t_info.get("currentPrice") or t_info.get("previousClose")
                prev_close = prev_close or t_info.get("regularMarketPreviousClose") or t_info.get("previousClose")
                volume = volume or t_info.get("regularMarketVolume") or t_info.get("volume")

            prev_close = prev_close or last_price
            day_change = (last_price - prev_close) if last_price and prev_close else 0.0
            day_change_percent = (day_change / prev_close * 100) if prev_close else 0.0

            return {
                "symbol": symbol.replace(".NS", "").replace(".BO", ""),
                "current_price": float(last_price) if last_price else None,
                "day_change": float(day_change),
                "day_change_percent": float(day_change_percent),
                "volume": int(volume) if volume else None,
                "market_cap": getattr(info, "market_cap", None),
                "week_52_high": getattr(info, "year_high", None),
                "week_52_low": getattr(info, "year_low", None),
            }
        except Exception as e:
            logger.error(f"Error fetching quote for {ticker_sym}: {e}")
            return {"symbol": symbol.replace(".NS", "").replace(".BO", "")}

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
        from concurrent.futures import ThreadPoolExecutor, as_completed
        from .exchange_directory import ALL_MARKET_INDICES

        def fetch_one_index(item):
            sym = item["symbol"]
            name = item["name"]
            quote = self.fetch_quote(sym)
            val = quote.get("current_price") or item.get("fallback_value") or 24800.0
            chg = quote.get("day_change") or 0.0
            chg_pct = quote.get("day_change_percent") or 0.0
            return {
                "symbol": sym,
                "name": name,
                "category": item.get("category", "Broad Market"),
                "value": float(val),
                "change": float(chg),
                "change_percent": float(chg_pct),
            }

        results = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_item = {executor.submit(fetch_one_index, item): item for item in ALL_MARKET_INDICES}
            for future in as_completed(future_to_item):
                try:
                    res = future.result()
                    results.append(res)
                except Exception as e:
                    item = future_to_item[future]
                    results.append({
                        "symbol": item["symbol"],
                        "name": item["name"],
                        "category": item.get("category", "Broad Market"),
                        "value": float(item.get("fallback_value", 24800.0)),
                        "change": 0.0,
                        "change_percent": 0.0,
                    })

        # Preserve order of ALL_MARKET_INDICES
        order_map = {item["symbol"]: idx for idx, item in enumerate(ALL_MARKET_INDICES)}
        results.sort(key=lambda x: order_map.get(x["symbol"], 999))
        return results
