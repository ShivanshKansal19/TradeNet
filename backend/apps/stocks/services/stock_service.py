from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from django.utils import timezone
from ..models import Stock, StockPrice, StockFundamental

class StockService:
    @staticmethod
    def get_stock_by_symbol(symbol: str) -> Optional[Stock]:
        clean_symbol = symbol.strip().upper().replace(".NS", "")
        return Stock.objects.filter(symbol__iexact=clean_symbol).first()

    @staticmethod
    def get_price_history(stock: Stock, time_range: str = "1y") -> List[StockPrice]:
        now = timezone.now().date()
        range_map = {
            "1d": now - timedelta(days=2),
            "1w": now - timedelta(days=7),
            "1m": now - timedelta(days=30),
            "3m": now - timedelta(days=90),
            "6m": now - timedelta(days=180),
            "1y": now - timedelta(days=365),
            "5y": now - timedelta(days=365 * 5),
            "all": None,
        }
        start_date = range_map.get(time_range.lower(), now - timedelta(days=365))
        qs = stock.prices.all()
        if start_date:
            qs = qs.filter(date__gte=start_date)
        return list(qs.order_by("date"))

    @staticmethod
    def search_stocks(query: str, limit: int = 20) -> List[Stock]:
        if not query:
            return list(Stock.objects.filter(is_active=True)[:limit])
        return list(
            Stock.objects.filter(is_active=True)
            .filter(
                models_q := (
                    models_q_filter(query)
                )
            )[:limit]
        )

def models_q_filter(query: str):
    from django.db.models import Q
    return Q(symbol__icontains=query) | Q(name__icontains=query) | Q(sector__icontains=query)
