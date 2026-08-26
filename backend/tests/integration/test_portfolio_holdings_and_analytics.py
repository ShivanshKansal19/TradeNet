import pytest
from decimal import Decimal
from rest_framework import status
from django.contrib.auth.models import User
from apps.portfolios.models import Portfolio, PortfolioHolding, Transaction
from apps.stocks.models import Stock, StockFundamental
from apps.market_data.models import MarketIndex

@pytest.fixture
def test_stock_alpha(db):
    stock = Stock.objects.create(
        symbol="TCS",
        name="Tata Consultancy Services",
        exchange="NSE",
        sector="Technology",
        current_price=Decimal("3800.00"),
        day_change=Decimal("38.00"),
        day_change_percent=Decimal("1.01"),
    )
    return stock

@pytest.fixture
def test_stock_beta(db):
    stock = Stock.objects.create(
        symbol="INFY",
        name="Infosys Limited",
        exchange="NSE",
        sector="Technology",
        current_price=Decimal("1600.00"),
        day_change=Decimal("-16.00"),
        day_change_percent=Decimal("-0.99"),
    )
    return stock

@pytest.fixture
def benchmark_nifty(db):
    return MarketIndex.objects.create(
        symbol="^NSEI",
        name="NIFTY 50",
        value=Decimal("24500.00"),
        change=Decimal("120.00"),
        change_percent=Decimal("0.49"),
    )

@pytest.mark.django_db
def test_portfolio_add_and_update_holding(api_client, test_user, test_stock_alpha):
    """
    Test POST /api/v1/portfolios/<id>/holdings/
    - Adds new holding
    - Logs Transaction BUY
    - Updates existing holding
    """
    api_client.force_authenticate(user=test_user)
    portfolio = Portfolio.objects.create(user=test_user, name="Tech Portfolio")

    # 1. Add new holding by symbol
    res = api_client.post(f"/api/v1/portfolios/{portfolio.id}/holdings/", {
        "symbol": "TCS",
        "quantity": 10,
        "average_buy_price": "3500.00",
    })
    assert res.status_code == status.HTTP_201_CREATED
    assert res.data["stock"]["symbol"] == "TCS"
    assert float(res.data["quantity"]) == 10.0
    assert float(res.data["average_buy_price"]) == 3500.00

    # Verify DB state
    holding = PortfolioHolding.objects.get(portfolio=portfolio, stock=test_stock_alpha)
    assert holding.quantity == Decimal("10.0000")
    assert holding.average_buy_price == Decimal("3500.00")

    # Verify Transaction log
    tx = Transaction.objects.filter(portfolio=portfolio, stock=test_stock_alpha).first()
    assert tx is not None
    assert tx.transaction_type == "BUY"
    assert tx.quantity == Decimal("10.0000")
    assert tx.price == Decimal("3500.00")

    # 2. Update existing holding (e.g. bought more or updated avg price)
    update_res = api_client.post(f"/api/v1/portfolios/{portfolio.id}/holdings/", {
        "symbol": "TCS",
        "quantity": 25,
        "average_buy_price": "3600.00",
    })
    assert update_res.status_code == status.HTTP_200_OK
    assert float(update_res.data["quantity"]) == 25.0
    assert float(update_res.data["average_buy_price"]) == 3600.00

    holding.refresh_from_db()
    assert holding.quantity == Decimal("25.0000")
    assert holding.average_buy_price == Decimal("3600.00")

@pytest.mark.django_db
def test_portfolio_delete_holding_by_symbol_and_id(api_client, test_user, test_stock_alpha, test_stock_beta):
    """
    Test DELETE /api/v1/portfolios/<id>/holdings/
    - Delete by holding_id
    - Delete by symbol
    """
    api_client.force_authenticate(user=test_user)
    portfolio = Portfolio.objects.create(user=test_user, name="Main Portfolio")

    h1 = PortfolioHolding.objects.create(
        portfolio=portfolio, stock=test_stock_alpha, quantity=Decimal("10"), average_buy_price=Decimal("3500")
    )
    h2 = PortfolioHolding.objects.create(
        portfolio=portfolio, stock=test_stock_beta, quantity=Decimal("20"), average_buy_price=Decimal("1500")
    )

    # 1. Delete h1 by holding_id
    del_res1 = api_client.delete(f"/api/v1/portfolios/{portfolio.id}/holdings/?holding_id={h1.id}")
    assert del_res1.status_code == status.HTTP_204_NO_CONTENT
    assert not PortfolioHolding.objects.filter(id=h1.id).exists()

    # 2. Delete h2 by symbol in query params
    del_res2 = api_client.delete(f"/api/v1/portfolios/{portfolio.id}/holdings/?symbol=INFY")
    assert del_res2.status_code == status.HTTP_204_NO_CONTENT
    assert not PortfolioHolding.objects.filter(id=h2.id).exists()

    # 3. Missing params -> 400
    del_res3 = api_client.delete(f"/api/v1/portfolios/{portfolio.id}/holdings/")
    assert del_res3.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_portfolio_holding_invalid_payload_rejected(api_client, test_user):
    """
    Test holding validation:
    - Missing symbol & stock_id
    - Non-positive quantity
    - Negative average buy price
    """
    api_client.force_authenticate(user=test_user)
    portfolio = Portfolio.objects.create(user=test_user, name="Validation Test")

    # Missing stock identifier
    res1 = api_client.post(f"/api/v1/portfolios/{portfolio.id}/holdings/", {
        "quantity": 10,
        "average_buy_price": 100,
    })
    assert res1.status_code == status.HTTP_400_BAD_REQUEST

    # Zero or negative quantity
    res2 = api_client.post(f"/api/v1/portfolios/{portfolio.id}/holdings/", {
        "symbol": "TCS",
        "quantity": 0,
        "average_buy_price": 100,
    })
    assert res2.status_code == status.HTTP_400_BAD_REQUEST

    # Negative price
    res3 = api_client.post(f"/api/v1/portfolios/{portfolio.id}/holdings/", {
        "symbol": "TCS",
        "quantity": 10,
        "average_buy_price": -50,
    })
    assert res3.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_portfolio_analytics_comprehensive_metrics(api_client, test_user, test_stock_alpha, test_stock_beta, benchmark_nifty):
    """
    Test GET /api/v1/portfolios/<id>/analytics/
    Verifies total investment, current value, total P&L, day P&L, sector allocation, and benchmark comparison.
    """
    api_client.force_authenticate(user=test_user)
    portfolio = Portfolio.objects.create(user=test_user, name="Growth & Alpha")

    # Stock Alpha (TCS): Qty 10 @ Avg 3500 = Invested 35,000 | Current 3800 = Value 38,000 | P&L = +3,000 | Day change = +38/share (+380)
    PortfolioHolding.objects.create(
        portfolio=portfolio,
        stock=test_stock_alpha,
        quantity=Decimal("10.0000"),
        average_buy_price=Decimal("3500.00"),
    )

    # Stock Beta (INFY): Qty 20 @ Avg 1500 = Invested 30,000 | Current 1600 = Value 32,000 | P&L = +2,000 | Day change = -16/share (-320)
    PortfolioHolding.objects.create(
        portfolio=portfolio,
        stock=test_stock_beta,
        quantity=Decimal("20.0000"),
        average_buy_price=Decimal("1500.00"),
    )

    res = api_client.get(f"/api/v1/portfolios/{portfolio.id}/analytics/")
    assert res.status_code == status.HTTP_200_OK
    data = res.data

    assert data["portfolio_id"] == portfolio.id
    assert data["total_invested"] == 65000.0
    assert data["total_current_value"] == 70000.0
    assert data["total_pnl"] == 5000.0
    assert data["total_return_percent"] == 7.69  # 5000 / 65000 * 100
    assert data["day_pnl"] == 60.0  # +380 - 320
    assert data["holdings_count"] == 2
    assert len(data["sector_allocations"]) == 1
    assert data["sector_allocations"][0]["sector"] == "Technology"
    assert data["sector_allocations"][0]["weight_percent"] == 100.0

    # Benchmark comparison
    assert "benchmark_comparison" in data
    bm = data["benchmark_comparison"]
    assert bm["benchmark_name"] == "NIFTY 50"
    assert bm["benchmark_return_percent"] == 0.49
    assert bm["portfolio_return_percent"] == 7.69
    assert bm["alpha"] == 7.20  # 7.69 - 0.49

@pytest.mark.django_db
def test_unauthorized_portfolio_holding_mutation_rejected(api_client, test_stock_alpha):
    """
    Test that User B cannot mutate or delete User A's portfolio holdings.
    """
    user_a = User.objects.create_user(username="usera", email="a@test.com", password="Password123!")
    user_b = User.objects.create_user(username="userb", email="b@test.com", password="Password123!")

    portfolio_a = Portfolio.objects.create(user=user_a, name="User A Portfolio")
    holding_a = PortfolioHolding.objects.create(
        portfolio=portfolio_a,
        stock=test_stock_alpha,
        quantity=Decimal("10"),
        average_buy_price=Decimal("3500"),
    )

    # User B logs in
    api_client.force_authenticate(user=user_b)

    # User B tries to add holding to User A's portfolio -> 404
    add_res = api_client.post(f"/api/v1/portfolios/{portfolio_a.id}/holdings/", {
        "symbol": "TCS",
        "quantity": 50,
        "average_buy_price": "3000.00",
    })
    assert add_res.status_code == status.HTTP_404_NOT_FOUND

    # User B tries to delete holding from User A's portfolio -> 404
    del_res = api_client.delete(f"/api/v1/portfolios/{portfolio_a.id}/holdings/?holding_id={holding_a.id}")
    assert del_res.status_code == status.HTTP_404_NOT_FOUND

    # Verify User A's holding is untouched
    holding_a.refresh_from_db()
    assert holding_a.quantity == Decimal("10.0000")
