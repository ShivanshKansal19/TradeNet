from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.stocks.models import Stock
from .models import TechnicalIndicator
from .serializers import TechnicalIndicatorSerializer

class StockTechnicalsView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, symbol):
        clean_symbol = symbol.strip().upper().replace(".NS", "")
        stock = get_object_or_404(Stock, symbol__iexact=clean_symbol)
        
        limit = int(request.query_params.get("limit", 30))
        indicators = stock.technical_indicators.all()[:limit]
        
        if not indicators.exists():
            return Response(
                {"detail": f"No technical indicators computed for {clean_symbol}."},
                status=status.HTTP_404_NOT_FOUND,
            )
            
        latest = indicators.first()
        return Response({
            "symbol": stock.symbol,
            "latest": TechnicalIndicatorSerializer(latest).data,
            "history": TechnicalIndicatorSerializer(indicators, many=True).data,
        })
