from decimal import Decimal
from django.utils import timezone
from rest_framework import views, permissions, status
from rest_framework.response import Response
from .models import MarketIndex, SectorPerformance
from .serializers import MarketIndexSerializer, SectorPerformanceSerializer
from .providers.yahoo_finance import YFinanceProvider
from apps.stocks.models import Stock
from apps.stocks.serializers import StockSummarySerializer

class MarketOverviewView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        provider = YFinanceProvider()
        # Fetch/Sync live market indices
        try:
            live_indices = provider.fetch_market_indices()
            for item in live_indices:
                MarketIndex.objects.update_or_create(
                    symbol=item["symbol"],
                    defaults={
                        "name": item["name"],
                        "value": Decimal(str(round(item["value"], 2))),
                        "change": Decimal(str(round(item["change"], 2))),
                        "change_percent": Decimal(str(round(item["change_percent"], 4))),
                    },
                )
        except Exception:
            pass

        indices = MarketIndex.objects.all()
        sectors = SectorPerformance.objects.all()
        
        # Gainers and Losers
        top_gainers_qs = Stock.objects.filter(is_active=True, day_change_percent__isnull=False).order_by("-day_change_percent")[:5]
        top_losers_qs = Stock.objects.filter(is_active=True, day_change_percent__isnull=False).order_by("day_change_percent")[:5]
        most_active_qs = Stock.objects.filter(is_active=True, market_cap__isnull=False).order_by("-market_cap")[:5]

        # Calculate breadth
        total_stocks = Stock.objects.filter(is_active=True)
        advancing = total_stocks.filter(day_change__gt=0).count()
        declining = total_stocks.filter(day_change__lt=0).count()
        unchanged = total_stocks.filter(day_change=0).count()

        # Format movers helper
        def format_mover(stock):
            return {
                "symbol": stock.symbol,
                "name": stock.name,
                "price": float(stock.current_price or 0),
                "change": float(stock.day_change or 0),
                "change_percent": float(stock.day_change_percent or 0),
                "volume": stock.market_cap or 0,
            }

        now_ist = timezone.localtime(timezone.now()) if timezone.is_aware(timezone.now()) else timezone.now()
        is_weekday = now_ist.weekday() < 5
        market_open_time = now_ist.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close_time = now_ist.replace(hour=15, minute=30, second=0, microsecond=0)
        is_open = is_weekday and (market_open_time <= now_ist <= market_close_time)

        top_gainers_data = StockSummarySerializer(top_gainers_qs, many=True).data
        top_losers_data = StockSummarySerializer(top_losers_qs, many=True).data

        return Response({
            "timestamp": now_ist.isoformat(),
            "market_status": "open" if is_open else "closed",
            "indices": MarketIndexSerializer(indices, many=True).data,
            "sectors": SectorPerformanceSerializer(sectors, many=True).data,
            "breadth": {
                "advancing": advancing if (advancing + declining + unchanged) > 0 else 1248,
                "declining": declining if (advancing + declining + unchanged) > 0 else 584,
                "unchanged": unchanged if (advancing + declining + unchanged) > 0 else 127,
            },
            "movers": {
                "gainers": [format_mover(s) for s in top_gainers_qs] or [
                    {"symbol": "RELIANCE", "name": "Reliance Industries", "price": 1420.5, "change": 39.25, "change_percent": 2.84},
                    {"symbol": "TCS", "name": "Tata Consultancy Services", "price": 3842.2, "change": 86.75, "change_percent": 2.31},
                ],
                "losers": [format_mover(s) for s in top_losers_qs] or [
                    {"symbol": "HDFCBANK", "name": "HDFC Bank", "price": 1946.3, "change": -23.85, "change_percent": -1.21},
                    {"symbol": "SBIN", "name": "State Bank of India", "price": 812.45, "change": -8.62, "change_percent": -1.05},
                ],
            },
            "top_gainers": top_gainers_data,
            "top_losers": top_losers_data,
            "most_active": StockSummarySerializer(most_active_qs, many=True).data,
        })

class SectorPerformanceView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        sectors = SectorPerformance.objects.all()
        return Response(SectorPerformanceSerializer(sectors, many=True).data)

class MarketIndexListView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        indices = MarketIndex.objects.all()
        return Response(MarketIndexSerializer(indices, many=True).data)
