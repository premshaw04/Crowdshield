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

@pytest.fixture
def venue_id():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "Gate Arena",
        "address": "123 Gate",
        "city": "City",
        "state": "State",
        "country": "Country",
        "latitude": 0.0,
        "longitude": 0.0,
        "map_type": "FLOOR_PLAN"
    }
    response = client.post(f"{settings.API_V1_STR}/venues", json=payload, headers=headers)
    assert response.status_code == 201
    return response.json()["id"]

def test_create_gate(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "North Entry",
        "gate_number": "N1",
        "type": "ENTRY",
        "capacity_per_hour": 1000,
        "location": {"x": 50.0, "y": 10.0}
    }
    response = client.post(
        f"{settings.API_V1_STR}/venues/{venue_id}/gates",
        json=payload,
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "North Entry"
    assert data["status"] == "CLOSED"

def test_create_gate_invalid_capacity(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "North Entry",
        "gate_number": "N1",
        "type": "ENTRY",
        "capacity_per_hour": -5,
        "location": {"x": 50.0, "y": 10.0}
    }
    response = client.post(
        f"{settings.API_V1_STR}/venues/{venue_id}/gates",
        json=payload,
        headers=headers
    )
    assert response.status_code == 422

def test_update_gate(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "North Entry",
        "gate_number": "N1",
        "type": "ENTRY",
        "capacity_per_hour": 1000,
        "location": {"x": 50.0, "y": 10.0}
    }
    res = client.post(f"{settings.API_V1_STR}/venues/{venue_id}/gates", json=payload, headers=headers)
    gate_id = res.json()["id"]
    
    # Update status to OPEN
    update_res = client.patch(
        f"{settings.API_V1_STR}/gates/{gate_id}",
        json={"status": "OPEN"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "OPEN"

def test_delete_gate(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": "To Delete",
        "gate_number": "D1",
        "type": "ENTRY",
        "capacity_per_hour": 1000,
        "location": {"x": 50.0, "y": 10.0}
    }
    res = client.post(f"{settings.API_V1_STR}/venues/{venue_id}/gates", json=payload, headers=headers)
    gate_id = res.json()["id"]

    del_res = client.delete(f"{settings.API_V1_STR}/gates/{gate_id}", headers=headers)
    assert del_res.status_code == 204

    get_res = client.get(f"{settings.API_V1_STR}/gates/{gate_id}", headers=headers)
    assert get_res.status_code == 404
