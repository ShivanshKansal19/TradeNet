from django.urls import path
from .views import MarketOverviewView, SectorPerformanceView, MarketIndexListView

urlpatterns = [
    path("overview", MarketOverviewView.as_view(), name="market-overview"),
    path("sectors", SectorPerformanceView.as_view(), name="market-sectors"),
    path("indices", MarketIndexListView.as_view(), name="market-indices"),
]
