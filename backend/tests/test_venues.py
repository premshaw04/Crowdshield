import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def get_auth_token():
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={"username": settings.DEMO_ADMIN_EMAIL, "password": settings.DEMO_ADMIN_PASSWORD}
    )
    return response.json()["access_token"]

def test_create_venue():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Central Park Main Stage",
        "address": "123 Park Ave",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "latitude": 40.7812,
        "longitude": -73.9665,
        "map_type": "GEOGRAPHIC"
    }
    response = client.post(
        f"{settings.API_V1_STR}/venues",
        json=payload,
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["latitude"] == payload["latitude"]
    assert "id" in data

def test_get_venues():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(
        f"{settings.API_V1_STR}/venues",
        headers=headers
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_venue_unauthorized():
    payload = {
        "name": "Hacker Arena",
        "address": "123 Dark Web",
        "city": "Unknown",
        "state": "UN",
        "country": "UN",
        "latitude": 0.0,
        "longitude": 0.0
    }
    response = client.post(
        f"{settings.API_V1_STR}/venues",
        json=payload
    )
    assert response.status_code == 401
