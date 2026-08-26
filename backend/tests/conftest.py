"""Pytest configuration and fixtures."""
import pytest
from decimal import Decimal
from datetime import date, timedelta
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from apps.stocks.models import Stock, StockPrice, StockFundamental
from apps.technicals.models import TechnicalIndicator
from apps.market_data.models import MarketIndex, SectorPerformance
from apps.forecasts.models import ForecastRun, Forecast
from apps.watchlists.models import Watchlist, WatchlistItem
from apps.portfolios.models import Portfolio, PortfolioHolding

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        username="trader1",
        email="trader1@example.com",
        password="securepassword123",
    )

@pytest.fixture
def auth_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client

@pytest.fixture
def sample_stock(db):
    stock = Stock.objects.create(
        symbol="RELIANCE",
        name="Reliance Industries Limited",
        exchange="NSE",
        sector="Energy",
        market_cap=2000000000000.0,
        current_price=Decimal("2950.00"),
        day_change=Decimal("15.00"),
        day_change_percent=Decimal("0.51"),
    )
    StockFundamental.objects.create(
        stock=stock,
        pe_ratio=Decimal("28.5"),
        pb_ratio=Decimal("2.4"),
        eps=Decimal("103.5"),
        roe=Decimal("0.095"),
    )
    # Add price history
    today = date.today()
    for i in range(30):
        d = today - timedelta(days=30 - i)
        price = Decimal(str(2900 + i * 2))
        StockPrice.objects.create(
            stock=stock,
            date=d,
            open_price=price - 5,
            high_price=price + 10,
            low_price=price - 10,
            close_price=price,
            volume=1000000 + i * 10000,
            adjusted_close=price,
        )
    return stock
