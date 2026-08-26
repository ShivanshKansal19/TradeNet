"""Master URL configuration for TradeNet API."""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # API v1 Domain Routes
    path("api/v1/auth/", include("apps.authentication.urls")),
    path("api/v1/stocks/", include("apps.stocks.urls")),
    path("api/v1/market/", include("apps.market_data.urls")),
    path("api/v1/watchlists/", include("apps.watchlists.urls")),
    path("api/v1/alerts/", include("apps.alerts.urls")),
    path("api/v1/portfolios/", include("apps.portfolios.urls")),
]
