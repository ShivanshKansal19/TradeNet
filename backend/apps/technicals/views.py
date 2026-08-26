from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.stocks.services.stock_service import StockService
from .models import TechnicalIndicator
from .serializers import TechnicalIndicatorSerializer

class StockTechnicalsView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, symbol):
        clean_symbol = symbol.strip().upper().replace(".NS", "").replace(".BO", "")
        stock = StockService.get_or_fetch_stock(clean_symbol)
        if not stock:
            return Response(
                {"detail": f"Stock {clean_symbol} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        limit = int(request.query_params.get("limit", 30))
        indicators = stock.technical_indicators.all()[:limit]
        
        latest = indicators.first()
        return Response({
            "symbol": stock.symbol,
            "latest": TechnicalIndicatorSerializer(latest).data if latest else None,
            "history": TechnicalIndicatorSerializer(indicators, many=True).data,
        })
