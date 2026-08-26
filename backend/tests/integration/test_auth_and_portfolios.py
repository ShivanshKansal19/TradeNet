import pytest
from rest_framework import status
from django.contrib.auth.models import User
from apps.portfolios.models import Portfolio

@pytest.mark.django_db
def test_user_registration_creates_account_and_default_portfolio(api_client):
    """
    Test that registering a new user creates the User model and automatically
    provisions a default 'My Portfolio' linked to that user.
    """
    response = api_client.post("/api/v1/auth/register/", {
        "username": "trader_shivam",
        "email": "shivam@example.com",
        "first_name": "Shivam",
        "last_name": "Sharma",
        "password": "SecurePassword123!",
        "password_confirm": "SecurePassword123!",
    })

    assert response.status_code == status.HTTP_201_CREATED
    data = response.data
    assert "access" in data
    assert "refresh" in data
    assert data["user"]["username"] == "trader_shivam"
    assert data["user"]["email"] == "shivam@example.com"

    # Verify user exists in database
    user = User.objects.get(username="trader_shivam")
    assert user.email == "shivam@example.com"
    assert user.first_name == "Shivam"

    # Verify default portfolio was auto-provisioned
    portfolios = Portfolio.objects.filter(user=user)
    assert portfolios.count() == 1
    default_portfolio = portfolios.first()
    assert default_portfolio.name == "My Portfolio"

@pytest.mark.django_db
def test_registration_password_mismatch_fails(api_client):
    response = api_client.post("/api/v1/auth/register/", {
        "username": "badpass_user",
        "email": "badpass@example.com",
        "password": "Password123!",
        "password_confirm": "DifferentPassword123!",
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.data

@pytest.mark.django_db
def test_user_login_and_token_refresh(api_client):
    # Register user first
    api_client.post("/api/v1/auth/register/", {
        "username": "login_trader",
        "email": "login@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!",
    })

    # Log in
    login_response = api_client.post("/api/v1/auth/login/", {
        "username": "login_trader",
        "password": "Password123!",
    })
    assert login_response.status_code == status.HTTP_200_OK
    assert "access" in login_response.data
    assert "refresh" in login_response.data
    refresh_token = login_response.data["refresh"]

    # Refresh token
    refresh_response = api_client.post("/api/v1/auth/token/refresh/", {
        "refresh": refresh_token,
    })
    assert refresh_response.status_code == status.HTTP_200_OK
    assert "access" in refresh_response.data
