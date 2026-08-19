from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.MarketOverviewView.as_view(), name='market_overview'),
    path('sectors/', views.SectorListView.as_view(), name='sector_list'),
]
