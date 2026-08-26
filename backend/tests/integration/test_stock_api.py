import pytest
from rest_framework import status

@pytest.mark.django_db
def test_stock_search_and_detail(api_client, sample_stock):
    # Search
    response = api_client.get("/api/v1/stocks/search?q=reliance")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] >= 1
    assert response.data["results"][0]["symbol"] == "RELIANCE"

    # Detail
    detail_res = api_client.get("/api/v1/stocks/RELIANCE")
    assert detail_res.status_code == status.HTTP_200_OK
    assert detail_res.data["symbol"] == "RELIANCE"
    assert "fundamentals" in detail_res.data
    assert detail_res.data["fundamentals"]["pe_ratio"] == "28.50"

    # History
    hist_res = api_client.get("/api/v1/stocks/RELIANCE/history?range=1m")
    assert hist_res.status_code == status.HTTP_200_OK
    assert hist_res.data["count"] > 0
    assert len(hist_res.data["prices"]) > 0

    # Fundamentals endpoint
    fund_res = api_client.get("/api/v1/stocks/RELIANCE/fundamentals")
    assert fund_res.status_code == status.HTTP_200_OK
    assert fund_res.data["pe_ratio"] == "28.50"
