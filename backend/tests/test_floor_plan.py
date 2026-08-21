import pytest
import io
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
        "name": "Indoor Arena",
        "address": "123 Indoor",
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

def test_upload_floor_plan(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a dummy image
    from PIL import Image
    image = Image.new('RGB', (100, 100))
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    files = {"file": ("test.png", img_byte_arr, "image/png")}
    response = client.post(
        f"{settings.API_V1_STR}/venues/{venue_id}/floor-plan",
        headers=headers,
        files=files
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["width"] == 100
    assert data["height"] == 100
    assert data["coordinate_system"] == "LOCAL_CARTESIAN"
    assert "url" in data

def test_get_floor_plan(venue_id):
    # Relies on the state set by the previous test due to how we mock? 
    # Let's just create one inside this test if not exists.
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Upload first
    from PIL import Image
    image = Image.new('RGB', (100, 100))
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    client.post(f"{settings.API_V1_STR}/venues/{venue_id}/floor-plan", headers=headers, files={"file": ("test.png", img_byte_arr, "image/png")})

    # Now get
    response = client.get(f"{settings.API_V1_STR}/venues/{venue_id}/floor-plan", headers=headers)
    assert response.status_code == 200
    assert response.json()["content_type"] == "image/png"

def test_delete_floor_plan(venue_id):
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Upload first
    from PIL import Image
    image = Image.new('RGB', (100, 100))
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    client.post(f"{settings.API_V1_STR}/venues/{venue_id}/floor-plan", headers=headers, files={"file": ("test.png", img_byte_arr, "image/png")})
    
    # Delete
    response = client.delete(f"{settings.API_V1_STR}/venues/{venue_id}/floor-plan", headers=headers)
    assert response.status_code == 204
    
    # Verify it's gone
    response = client.get(f"{settings.API_V1_STR}/venues/{venue_id}/floor-plan", headers=headers)
    assert response.status_code == 404
