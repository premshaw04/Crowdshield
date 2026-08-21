import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.api import dependencies
from app.models.user import User, Role
from app.models.gate import GateStatus

client = TestClient(app)

def override_get_current_user():
    return User(
        id="user-123",
        email="admin@test.com",
        name="Admin",
        role=Role.AUTHORITY,
        is_active=True,
    )

app.dependency_overrides[dependencies.get_current_user] = override_get_current_user

def override_get_db():
    yield MagicMock()

app.dependency_overrides[dependencies.get_db] = override_get_db

@patch("app.api.v1.endpoints.gates.GateRepository")
@patch("app.api.v1.endpoints.gates.gate_simulation_service")
def test_simulate_open_gate(mock_sim_service, mock_gate_repo_class):
    mock_repo = mock_gate_repo_class.return_value
    mock_gate = MagicMock()
    mock_gate.id = "gate-1"
    mock_gate.status = GateStatus.CLOSED
    mock_repo.get.return_value = mock_gate
    
    # Setup mock for service return
    mock_updated_gate = MagicMock()
    mock_updated_gate.id = "gate-1"
    mock_updated_gate.status = GateStatus.OPENING
    mock_updated_gate.name = "Test Gate"
    mock_updated_gate.gate_number = "1"
    mock_updated_gate.type = "ENTRY"
    mock_updated_gate.capacity_per_hour = 1000
    mock_updated_gate.location = {"x": 0, "y": 0}
    mock_updated_gate.venue_id = "venue-1"
    from datetime import datetime, timezone
    mock_updated_gate.created_at = datetime.now(timezone.utc)
    mock_updated_gate.updated_at = datetime.now(timezone.utc)
    
    mock_sim_service.simulate_open.return_value = mock_updated_gate
    
    response = client.post("/api/v1/gates/gate-1/simulate/open")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPENING"
    
    # verify service called with current_user.id
    mock_sim_service.simulate_open.assert_called_once()
    assert mock_sim_service.simulate_open.call_args[0][2] == "user-123"

@patch("app.api.v1.endpoints.gates.GateRepository")
def test_simulate_open_gate_not_found(mock_gate_repo_class):
    mock_repo = mock_gate_repo_class.return_value
    mock_repo.get.return_value = None
    
    response = client.post("/api/v1/gates/gate-invalid/simulate/open")
    assert response.status_code == 404
