from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.stocks.models import Stock
from .models import Forecast
from .serializers import ForecastSerializer

class StockForecastView(APIView):
    """Retrieve multi-horizon forecasts for a stock."""
    def get(self, request, symbol):
        stock = get_object_or_404(Stock, symbol__iexact=symbol)
        horizon = request.query_params.get('horizon')
        query = Forecast.objects.filter(stock=stock).order_by('-date_generated')
        if horizon:
            query = query.filter(horizon_days=int(horizon.replace('d', '')))
        forecasts = query[:3]
        serializer = ForecastSerializer(forecasts, many=True)
        return Response({
            'symbol': stock.symbol,
            'forecasts': serializer.data
        })
