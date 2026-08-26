from rest_framework import generics, status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Stock, StockPrice, StockFundamental
from .serializers import (
    StockDetailSerializer,
    StockSummarySerializer,
    StockPriceSerializer,
    StockFundamentalSerializer,
)
from .services.stock_service import StockService

class StockListView(generics.ListAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = StockSummarySerializer

    def get_queryset(self):
        qs = Stock.objects.filter(is_active=True)
        sector = self.request.query_params.get("sector")
        min_market_cap = self.request.query_params.get("min_market_cap")
        max_pe = self.request.query_params.get("max_pe")

        if sector:
            qs = qs.filter(sector__iexact=sector)
        if min_market_cap:
            try:
                qs = qs.filter(market_cap__gte=float(min_market_cap))
            except ValueError:
                pass
        if max_pe:
            try:
                qs = qs.filter(fundamentals__pe_ratio__lte=float(max_pe))
            except ValueError:
                pass

        return qs.order_by("symbol")

class StockSearchView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        query = request.query_params.get("q", "").strip()
        limit = int(request.query_params.get("limit", 20))
        results = StockService.search_stocks(query, limit=limit)
        serializer = StockSummarySerializer(results, many=True)
        return Response({"count": len(results), "results": serializer.data})

class StockDetailView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, symbol):
        clean_symbol = symbol.strip().upper().replace(".NS", "")
        stock = get_object_or_404(Stock, symbol__iexact=clean_symbol)
        serializer = StockDetailSerializer(stock)
        return Response(serializer.data)

class StockHistoryView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, symbol):
        clean_symbol = symbol.strip().upper().replace(".NS", "")
        stock = get_object_or_404(Stock, symbol__iexact=clean_symbol)
        time_range = request.query_params.get("range", "1y")
        history = StockService.get_price_history(stock, time_range=time_range)
        serializer = StockPriceSerializer(history, many=True)
        return Response({
            "symbol": stock.symbol,
            "range": time_range,
            "count": len(history),
            "prices": serializer.data,
        })

class StockFundamentalsView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, symbol):
        clean_symbol = symbol.strip().upper().replace(".NS", "")
        stock = get_object_or_404(Stock, symbol__iexact=clean_symbol)
        try:
            fundamental = stock.fundamentals
            serializer = StockFundamentalSerializer(fundamental)
            return Response(serializer.data)
        except StockFundamental.DoesNotExist:
            return Response(
                {"detail": f"No fundamentals found for {clean_symbol}."},
                status=status.HTTP_404_NOT_FOUND,
            )
