from django.urls import path
from . import views

urlpatterns = [
    path('<str:symbol>/', views.StockForecastView.as_view(), name='stock_forecast'),
]
