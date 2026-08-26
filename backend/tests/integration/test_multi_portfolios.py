import pytest
from rest_framework import status
from django.contrib.auth.models import User
from apps.portfolios.models import Portfolio, PortfolioHolding
from apps.stocks.models import Stock

@pytest.mark.django_db
def test_portfolio_crud_lifecycle(api_client):
    """
    Test full CRUD lifecycle of portfolios for an authenticated user:
    - List portfolios
    - Create new named portfolios
    - Retrieve portfolio detail
    - Update portfolio name and description
    - Delete portfolio
    """
    # Create user
    user = User.objects.create_user(
        username="portfolio_trader",
        email="trader@example.com",
        password="Password123!",
    )
    api_client.force_authenticate(user=user)

    # 1. Initial list (empty)
    res = api_client.get("/api/v1/portfolios/")
    assert res.status_code == status.HTTP_200_OK
    portfolios = res.data["results"] if isinstance(res.data, dict) and "results" in res.data else res.data
    assert len(portfolios) == 0

    # 2. Create first portfolio: "Long-Term Equity"
    create_res1 = api_client.post("/api/v1/portfolios/", {
        "name": "Long-Term Equity",
        "description": "Core retirement and compounders",
    })
    assert create_res1.status_code == status.HTTP_201_CREATED
    p1_id = create_res1.data["id"]
    assert create_res1.data["name"] == "Long-Term Equity"
    assert create_res1.data["description"] == "Core retirement and compounders"

    # 3. Create second portfolio: "Momentum Trades"
    create_res2 = api_client.post("/api/v1/portfolios/", {
        "name": "Momentum Trades",
        "description": "Swing and breakout strategies",
    })
    assert create_res2.status_code == status.HTTP_201_CREATED
    p2_id = create_res2.data["id"]

    # 4. List all portfolios (should have 2)
    list_res = api_client.get("/api/v1/portfolios/")
    assert list_res.status_code == status.HTTP_200_OK
    portfolios_list = list_res.data["results"] if isinstance(list_res.data, dict) and "results" in list_res.data else list_res.data
    assert len(portfolios_list) == 2
    portfolio_names = [p["name"] for p in portfolios_list]
    assert "Long-Term Equity" in portfolio_names
    assert "Momentum Trades" in portfolio_names

    # 5. Retrieve detail for p1
    detail_res = api_client.get(f"/api/v1/portfolios/{p1_id}/")
    assert detail_res.status_code == status.HTTP_200_OK
    assert detail_res.data["id"] == p1_id
    assert detail_res.data["name"] == "Long-Term Equity"

    # 6. Update p1 (PATCH)
    update_res = api_client.patch(f"/api/v1/portfolios/{p1_id}/", {
        "name": "Long-Term Wealth",
        "description": "Updated description",
    })
    assert update_res.status_code == status.HTTP_200_OK
    assert update_res.data["name"] == "Long-Term Wealth"
    assert update_res.data["description"] == "Updated description"

    # 7. Delete p2
    delete_res = api_client.delete(f"/api/v1/portfolios/{p2_id}/")
    assert delete_res.status_code == status.HTTP_204_NO_CONTENT

    # Verify p2 deleted from DB and list
    list_after_delete = api_client.get("/api/v1/portfolios/")
    portfolios_after = list_after_delete.data["results"] if isinstance(list_after_delete.data, dict) and "results" in list_after_delete.data else list_after_delete.data
    assert len(portfolios_after) == 1
    assert portfolios_after[0]["id"] == p1_id


@pytest.mark.django_db
def test_cross_user_portfolio_data_isolation(api_client):
    """
    Test strict cross-user data isolation:
    User B must not be able to view, update, or delete User A's portfolios.
    """
    user_a = User.objects.create_user(username="user_a", email="a@example.com", password="Password123!")
    user_b = User.objects.create_user(username="user_b", email="b@example.com", password="Password123!")

    # Create portfolio for User A
    portfolio_a = Portfolio.objects.create(
        user=user_a,
        name="User A Secret Alpha",
        description="Top secret holdings",
    )

    # Authenticate as User B
    api_client.force_authenticate(user=user_b)

    # User B lists portfolios -> should NOT include User A's portfolio
    list_res = api_client.get("/api/v1/portfolios/")
    assert list_res.status_code == status.HTTP_200_OK
    portfolios_b = list_res.data["results"] if isinstance(list_res.data, dict) and "results" in list_res.data else list_res.data
    assert len(portfolios_b) == 0

    # User B tries to GET User A's portfolio detail -> 404
    detail_res = api_client.get(f"/api/v1/portfolios/{portfolio_a.id}/")
    assert detail_res.status_code == status.HTTP_404_NOT_FOUND

    # User B tries to PATCH User A's portfolio -> 404
    patch_res = api_client.patch(f"/api/v1/portfolios/{portfolio_a.id}/", {
        "name": "Hacked Portfolio Name",
    })
    assert patch_res.status_code == status.HTTP_404_NOT_FOUND

    # User B tries to DELETE User A's portfolio -> 404
    delete_res = api_client.delete(f"/api/v1/portfolios/{portfolio_a.id}/")
    assert delete_res.status_code == status.HTTP_404_NOT_FOUND

    # User B tries to GET User A's portfolio analytics -> 404
    analytics_res = api_client.get(f"/api/v1/portfolios/{portfolio_a.id}/analytics/")
    assert analytics_res.status_code == status.HTTP_404_NOT_FOUND

    # Verify User A's portfolio remained unchanged in DB
    portfolio_a.refresh_from_db()
    assert portfolio_a.name == "User A Secret Alpha"


@pytest.mark.django_db
def test_unauthenticated_portfolio_access_rejected(api_client):
    """
    Test that unauthenticated requests to portfolio endpoints return 401 Unauthorized.
    """
    res_list = api_client.get("/api/v1/portfolios/")
    assert res_list.status_code == status.HTTP_401_UNAUTHORIZED

    res_create = api_client.post("/api/v1/portfolios/", {"name": "Test"})
    assert res_create.status_code == status.HTTP_401_UNAUTHORIZED
