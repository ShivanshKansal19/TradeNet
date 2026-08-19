import yfinance as yf
from typing import Dict, Any, List
from .base import BaseMarketDataProvider

class YahooFinanceProvider(BaseMarketDataProvider):
    """Market data provider using Yahoo Finance API for NSE stocks."""

    def _format_symbol(self, symbol: str) -> str:
        if not symbol.endswith('.NS') and not symbol.startswith('^'):
            return f"{symbol}.NS"
        return symbol

    def fetch_quote(self, symbol: str) -> Dict[str, Any]:
        formatted = self._format_symbol(symbol)
        ticker = yf.Ticker(formatted)
        info = ticker.fast_info
        return {
            'symbol': symbol,
            'last_price': getattr(info, 'last_price', None),
            'previous_close': getattr(info, 'previous_close', None),
            'open': getattr(info, 'open', None),
            'day_high': getattr(info, 'day_high', None),
            'day_low': getattr(info, 'day_low', None),
            'year_high': getattr(info, 'year_high', None),
            'year_low': getattr(info, 'year_low', None),
        }

    def fetch_history(self, symbol: str, period: str = '1y') -> List[Dict[str, Any]]:
        formatted = self._format_symbol(symbol)
        ticker = yf.Ticker(formatted)
        df = ticker.history(period=period)
        records = []
        for index, row in df.iterrows():
            records.append({
                'date': index.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume']),
            })
        return records

    def fetch_market_overview(self) -> Dict[str, Any]:
        nifty = yf.Ticker('^NSEI').fast_info
        sensex = yf.Ticker('^BSESN').fast_info
        return {
            'indices': [
                {
                    'symbol': '^NSEI',
                    'name': 'NIFTY 50',
                    'value': getattr(nifty, 'last_price', 0),
                    'change': getattr(nifty, 'last_price', 0) - getattr(nifty, 'previous_close', 0),
                    'percent_change': ((getattr(nifty, 'last_price', 0) - getattr(nifty, 'previous_close', 0)) / getattr(nifty, 'previous_close', 1)) * 100
                },
                {
                    'symbol': '^BSESN',
                    'name': 'SENSEX',
                    'value': getattr(sensex, 'last_price', 0),
                    'change': getattr(sensex, 'last_price', 0) - getattr(sensex, 'previous_close', 0),
                    'percent_change': ((getattr(sensex, 'last_price', 0) - getattr(sensex, 'previous_close', 0)) / getattr(sensex, 'previous_close', 1)) * 100
                }
            ]
        }
