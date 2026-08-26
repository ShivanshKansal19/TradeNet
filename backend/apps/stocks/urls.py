from django.urls import path
from .views import (
    StockListView,
    StockSearchView,
    StockDetailView,
    StockHistoryView,
    StockFundamentalsView,
)
from apps.technicals.views import StockTechnicalsView
from apps.forecasts.views import StockForecastView

urlpatterns = [
    path("", StockListView.as_view(), name="stock-list"),
    path("search", StockSearchView.as_view(), name="stock-search"),
    path("<str:symbol>", StockDetailView.as_view(), name="stock-detail"),
    path("<str:symbol>/history", StockHistoryView.as_view(), name="stock-history"),
    path("<str:symbol>/fundamentals", StockFundamentalsView.as_view(), name="stock-fundamentals"),
    path("<str:symbol>/technicals", StockTechnicalsView.as_view(), name="stock-technicals"),
    path("<str:symbol>/forecast", StockForecastView.as_view(), name="stock-forecast"),
]
