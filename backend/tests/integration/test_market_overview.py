import pytest
from decimal import Decimal
from rest_framework import status
from apps.market_data.models import MarketIndex, SectorPerformance

@pytest.mark.django_db
def test_market_overview_endpoint(api_client, sample_stock):
    MarketIndex.objects.create(
        symbol="^NSEI",
        name="NIFTY 50",
        value=Decimal("25000.00"),
        change=Decimal("150.00"),
        change_percent=Decimal("0.60"),
    )
    SectorPerformance.objects.create(
        sector_name="Energy",
        change_percent=Decimal("0.85"),
        top_gainer="RELIANCE",
        top_loser="ONGC",
        market_cap=2000000000000.0,
    )

    response = api_client.get("/api/v1/market/overview")
    assert response.status_code == status.HTTP_200_OK
    assert "indices" in response.data
    assert "sectors" in response.data
    assert "top_gainers" in response.data
    assert len(response.data["indices"]) == 1
    assert response.data["indices"][0]["name"] == "NIFTY 50"
    assert len(response.data["sectors"]) == 1
    assert response.data["sectors"][0]["sector_name"] == "Energy"
