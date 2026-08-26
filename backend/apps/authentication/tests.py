from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


class AuthenticationIntegrationTests(APITestCase):
    def setUp(self):
        self.username = "testtrader"
        self.password = "Secur3Passw0rd!"
        self.email = "testtrader@example.com"
        self.user = User.objects.create_user(
            username=self.username,
            password=self.password,
            email=self.email,
            first_name="Test",
            last_name="Trader",
        )

    def test_user_registration(self):
        url = reverse("auth-register")
        data = {
            "username": "newtrader",
            "email": "newtrader@example.com",
            "password": "Password123!",
            "password_confirm": "Password123!",
            "first_name": "New",
            "last_name": "Trader",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["username"], "newtrader")

    def test_user_login(self):
        url = reverse("auth-login")
        data = {
            "username": self.username,
            "password": self.password,
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_token_refresh(self):
        refresh = RefreshToken.for_user(self.user)
        url = reverse("token-refresh")
        data = {
            "refresh": str(refresh),
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_profile_unauthorized_without_token(self):
        url = reverse("auth-profile")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_authorized_with_bearer_token(self):
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)
        url = reverse("auth-profile")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.username)
        self.assertEqual(response.data["email"], self.email)
