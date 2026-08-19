from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.StockSearchView.as_view(), name='stock_search'),
    path('<str:symbol>/', views.StockDetailView.as_view(), name='stock_detail'),
    path('<str:symbol>/history/', views.StockHistoryView.as_view(), name='stock_history'),
]
