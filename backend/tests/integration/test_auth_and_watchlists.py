import pytest
from rest_framework import status

@pytest.mark.django_db
def test_auth_registration_login_and_watchlist(api_client, sample_stock):
    # 1. Register
    reg_res = api_client.post("/api/v1/auth/register/", {
        "username": "newinvestor",
        "email": "investor@example.com",
        "password": "mypassword123",
        "password_confirm": "mypassword123",
    })
    assert reg_res.status_code == status.HTTP_201_CREATED

    # 2. Login to get JWT
    login_res = api_client.post("/api/v1/auth/login/", {
        "username": "newinvestor",
        "password": "mypassword123",
    })
    assert login_res.status_code == status.HTTP_200_OK
    assert "access" in login_res.data
    token = login_res.data["access"]

    # 3. Create Watchlist with Bearer token
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    wl_res = api_client.post("/api/v1/watchlists/", {"name": "Tech & Energy Favorites"})
    assert wl_res.status_code == status.HTTP_201_CREATED
    wl_id = wl_res.data["id"]

    # 4. Add Stock to Watchlist
    item_res = api_client.post(f"/api/v1/watchlists/{wl_id}/items", {
        "stock_id": sample_stock.id,
        "notes": "Key large-cap energy play"
    })
    assert item_res.status_code == status.HTTP_201_CREATED

    # 5. Retrieve Watchlist
    get_wl = api_client.get(f"/api/v1/watchlists/{wl_id}")
    assert get_wl.status_code == status.HTTP_200_OK
    assert get_wl.data["items_count"] == 1
    assert get_wl.data["items"][0]["stock"]["symbol"] == "RELIANCE"
