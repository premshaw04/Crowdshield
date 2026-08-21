import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_login_invalid_credentials():
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": "wrong@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["message"]

def test_access_protected_route_without_token():
    response = client.get(f"{settings.API_V1_STR}/auth/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.json()["message"]
