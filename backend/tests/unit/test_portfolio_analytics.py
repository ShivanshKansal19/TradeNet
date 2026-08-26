import pytest
from decimal import Decimal
from apps.portfolios.models import Portfolio, PortfolioHolding
from apps.portfolios.analytics import calculate_portfolio_analytics
from apps.stocks.models import Stock

@pytest.mark.django_db
def test_portfolio_analytics_calculation(test_user, sample_stock):
    portfolio = Portfolio.objects.create(user=test_user, name="Main Growth")
    PortfolioHolding.objects.create(
        portfolio=portfolio,
        stock=sample_stock,
        quantity=Decimal("10.00"),
        average_buy_price=Decimal("2500.00"),
    )

    # Current price of sample_stock is 2950.00
    analytics = calculate_portfolio_analytics(portfolio)

    assert analytics["portfolio_id"] == portfolio.id
    assert analytics["total_invested"] == 25000.0
    assert analytics["total_current_value"] == 29500.0
    assert analytics["total_pnl"] == 4500.0
    assert analytics["total_return_percent"] == 18.0
    assert len(analytics["sector_allocations"]) == 1
    assert analytics["sector_allocations"][0]["sector"] == "Energy"
    assert analytics["sector_allocations"][0]["weight_percent"] == 100.0
