import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.api import dependencies
from app.models.user import User, Role
from app.models.recommendation import RecommendationStatus
from app.ai.risk.risk_engine import RiskLevel
from app.ai.recommendation.service import RecommendationService

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

@patch("app.ai.recommendation.service.safe_route_repository")
@patch("app.ai.recommendation.service.recommendation_repository")
@patch("app.ai.recommendation.service.GateRepository")
def test_recommendation_service_logic(mock_gate_repo_class, mock_rec_repo, mock_route_repo):
    db = MagicMock()
    event = MagicMock()
    event.id = "event-1"
    event.venue_id = "venue-1"
    
    # Setup mock safe routes
    mock_route = MagicMock()
    mock_route.id = "route-1"
    mock_route.source_zone_id = "zone-1"
    mock_route.status = "APPROVED"
    mock_route.name = "Escape Route A"
    
    mock_source_zone = MagicMock()
    mock_source_zone.name = "Food Court"
    mock_route.source_zone = mock_source_zone
    
    mock_route.destination_gate_id = "gate-1"
    mock_dest_gate = MagicMock()
    mock_dest_gate.name = "Gate 5"
    mock_route.destination_gate = mock_dest_gate
    
    mock_route_repo.get_by_venue.return_value = [mock_route]
    
    # Setup mock existing recs to empty so it creates new ones
    mock_rec_repo.get_by_event.return_value = []
    
    # Setup Gate mock (assume gate is closed so we trigger OPEN_GATE)
    mock_gate_repo = mock_gate_repo_class.return_value
    mock_gate = MagicMock()
    mock_gate.id = "gate-1"
    mock_gate.status = "CLOSED"
    mock_gate_repo.get.return_value = mock_gate
    
    # Mock create
    mock_rec_repo.create.return_value = MagicMock()
    
    service = RecommendationService()
    recs = service.evaluate_zone_risk(db, event, "zone-1", RiskLevel.CRITICAL, 95.0)
    
    assert len(recs) == 2
    
    # Verify redirects
    calls = mock_rec_repo.create.call_args_list
    assert len(calls) == 2
    
    # First call should be REDIRECT_CROWD
    assert calls[0].kwargs["type"] == "REDIRECT_CROWD"
    assert "Escape Route A" in calls[0].kwargs["reason"]
    assert calls[0].kwargs["route_id"] == "route-1"
    
    # Second call should be OPEN_GATE
    assert calls[1].kwargs["type"] == "OPEN_GATE"
    assert "Gate 5" in calls[1].kwargs["reason"]
    assert calls[1].kwargs["gate_id"] == "gate-1"


@patch("app.api.v1.endpoints.recommendations.recommendation_repository")
def test_approve_recommendation(mock_repo):
    mock_rec = MagicMock()
    mock_rec.id = "rec-1"
    mock_rec.status = RecommendationStatus.APPROVED
    mock_rec.type = "REDIRECT_CROWD"
    mock_rec.reason = "Test"
    mock_rec.route_id = "route-1"
    mock_rec.gate_id = None
    mock_rec.risk_score = 90.0
    mock_rec.event_id = "event-1"
    mock_rec.zone_id = "zone-1"
    mock_rec.approved_by = "user-123"
    
    from datetime import datetime, timezone
    mock_rec.created_at = datetime.now(timezone.utc)
    mock_rec.approved_at = datetime.now(timezone.utc)
    mock_rec.executed_at = None
    
    mock_repo.get.return_value = mock_rec
    mock_repo.approve.return_value = mock_rec
    
    response = client.post("/api/v1/recommendations/rec-1/approve")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "APPROVED"
    assert data["approved_by"] == "user-123"
