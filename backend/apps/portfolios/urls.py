from django.urls import path
from .views import (
    PortfolioListCreateView,
    PortfolioDetailView,
    PortfolioHoldingManageView,
    PortfolioAnalyticsView,
)

urlpatterns = [
    path("", PortfolioListCreateView.as_view(), name="portfolio-list-create"),
    path("<int:pk>", PortfolioDetailView.as_view(), name="portfolio-detail"),
    path("<int:pk>/holdings", PortfolioHoldingManageView.as_view(), name="portfolio-holdings"),
    path("<int:pk>/analytics", PortfolioAnalyticsView.as_view(), name="portfolio-analytics"),
]
