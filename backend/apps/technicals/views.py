from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.stocks.models import Stock
from .models import TechnicalIndicator
from .serializers import TechnicalIndicatorSerializer

class TechnicalIndicatorDetailView(APIView):
    """Retrieve technical indicators for a given stock symbol."""
    def get(self, request, symbol):
        stock = get_object_or_404(Stock, symbol__iexact=symbol)
        indicators = TechnicalIndicator.objects.filter(stock=stock).order_by('-date').first()
        if not indicators:
            return Response({'symbol': stock.symbol, 'message': 'No computed indicators available'})
        serializer = TechnicalIndicatorSerializer(indicators)
        return Response(serializer.data)
