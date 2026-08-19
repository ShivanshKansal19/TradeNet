"""
Master URL configuration for TradeNet.
Routes API endpoints under /api/v1/ and connects domain apps.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1 Endpoints
    path('api/v1/stocks/', include('apps.stocks.urls')),
    path('api/v1/market/', include('apps.market_data.urls')),
    path('api/v1/technicals/', include('apps.technicals.urls')),
    path('api/v1/forecasts/', include('apps.forecasts.urls')),
    path('api/v1/watchlists/', include('apps.watchlists.urls')),
    path('api/v1/alerts/', include('apps.alerts.urls')),
    path('api/v1/portfolios/', include('apps.portfolios.urls')),
    path('api/v1/auth/', include('apps.authentication.urls')),
]
