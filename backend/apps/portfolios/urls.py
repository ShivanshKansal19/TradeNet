from django.urls import path, re_path
from .views import (
    PortfolioListCreateView,
    PortfolioDetailView,
    PortfolioHoldingManageView,
    PortfolioAnalyticsView,
)

urlpatterns = [
    path("", PortfolioListCreateView.as_view(), name="portfolio-list-create"),
    re_path(r"^(?P<pk>\d+)/?$", PortfolioDetailView.as_view(), name="portfolio-detail"),
    re_path(r"^(?P<pk>\d+)/holdings/?$", PortfolioHoldingManageView.as_view(), name="portfolio-holdings"),
    re_path(r"^(?P<pk>\d+)/analytics/?$", PortfolioAnalyticsView.as_view(), name="portfolio-analytics"),
]
