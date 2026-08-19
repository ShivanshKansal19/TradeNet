from django.urls import path
from . import views

urlpatterns = [
    path('', views.PortfolioListView.as_view(), name='portfolio_list'),
]
