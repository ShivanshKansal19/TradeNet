from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.stocks.services.stock_service import StockService
from .models import Forecast
from .serializers import ForecastSerializer

class StockForecastView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, symbol):
        clean_symbol = symbol.strip().upper().replace(".NS", "").replace(".BO", "")
        stock = StockService.get_or_fetch_stock(clean_symbol)
        if not stock:
            return Response(
                {"detail": f"Stock {clean_symbol} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        horizon_param = request.query_params.get("horizon", "5d").lower().replace("d", "")
        try:
            horizon = int(horizon_param)
        except ValueError:
            horizon = 5

        # Get latest forecast for specific horizon or all horizons (1, 5, 20)
        forecasts = stock.forecasts.filter(horizon_days=horizon).order_by("-generated_at")
        all_latest_horizons = []
        for h in [1, 5, 20]:
            fc = stock.forecasts.filter(horizon_days=h).order_by("-generated_at").first()
            if fc:
                all_latest_horizons.append(fc)

        latest_for_horizon = forecasts.first()
        
        return Response({
            "symbol": stock.symbol,
            "selected_horizon": horizon,
            "forecast": ForecastSerializer(latest_for_horizon).data if latest_for_horizon else None,
            "all_horizons": ForecastSerializer(all_latest_horizons, many=True).data,
        })
