from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Stock, StockPrice
from .serializers import StockSerializer, StockPriceSerializer

class StockSearchView(APIView):
    """Search stocks by symbol or name."""
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])
        stocks = Stock.objects.filter(symbol__icontains=query)[:10]
        serializer = StockSerializer(stocks, many=True)
        return Response(serializer.data)

class StockDetailView(APIView):
    """Retrieve detailed info for a single stock."""
    def get(self, request, symbol):
        stock = get_object_or_404(Stock, symbol__iexact=symbol)
        serializer = StockSerializer(stock)
        return Response(serializer.data)

class StockHistoryView(APIView):
    """Retrieve historical price data for a stock."""
    def get(self, request, symbol):
        stock = get_object_or_404(Stock, symbol__iexact=symbol)
        range_param = request.query_params.get('range', '1y')
        prices = StockPrice.objects.filter(stock=stock).order_by('-date')[:250]
        serializer = StockPriceSerializer(prices, many=True)
        return Response({
            'symbol': stock.symbol,
            'range': range_param,
            'history': serializer.data
        })
