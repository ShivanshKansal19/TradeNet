from rest_framework import views, permissions, status
from rest_framework.response import Response
from .models import MarketIndex, SectorPerformance
from .serializers import MarketIndexSerializer, SectorPerformanceSerializer
from apps.stocks.models import Stock
from apps.stocks.serializers import StockSummarySerializer

class MarketOverviewView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        indices = MarketIndex.objects.all()
        sectors = SectorPerformance.objects.all()
        
        # Gainers and Losers
        top_gainers = Stock.objects.filter(is_active=True, day_change_percent__isnull=False).order_by("-day_change_percent")[:5]
        top_losers = Stock.objects.filter(is_active=True, day_change_percent__isnull=False).order_by("day_change_percent")[:5]
        most_active = Stock.objects.filter(is_active=True, market_cap__isnull=False).order_by("-market_cap")[:5]

        return Response({
            "indices": MarketIndexSerializer(indices, many=True).data,
            "sectors": SectorPerformanceSerializer(sectors, many=True).data,
            "top_gainers": StockSummarySerializer(top_gainers, many=True).data,
            "top_losers": StockSummarySerializer(top_losers, many=True).data,
            "most_active": StockSummarySerializer(most_active, many=True).data,
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
