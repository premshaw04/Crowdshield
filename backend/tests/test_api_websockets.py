import pytest
import asyncio
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocketDisconnect
from unittest.mock import patch, MagicMock
from app.main import app
from app.api.v1.endpoints import ws
from app.models.user import User, Role
from app.services.pubsub.events import WSEventPayload, RISK_UPDATED, RECOMMENDATION_APPROVED

client = TestClient(app)

def get_mock_user(role=Role.AUTHORITY):
    return User(
        id="user-123",
        email="test@test.com",
        name="Test User",
        role=role,
        is_active=True
    )

@patch("app.api.v1.endpoints.ws.get_user_from_token")
def test_websocket_missing_token(mock_get_user):
    with pytest.raises(WebSocketDisconnect) as e:
        with client.websocket_connect("/api/v1/ws/events/event-1"):
            pass
    assert e.value.code == 1008

@patch("app.api.v1.endpoints.ws.get_user_from_token")
@pytest.mark.anyio
async def test_websocket_connection_and_broadcast(mock_get_user):
    # Mocking the async function properly
    async def mock_return(*args, **kwargs):
        return get_mock_user(Role.AUTHORITY)
    mock_get_user.side_effect = mock_return

    from app.services.pubsub.connection_manager import manager
    from app.services.pubsub.broker import broker
    
    # We use the test client as a context manager for the websocket
    with client.websocket_connect("/api/v1/ws/events/event-1?token=valid_token") as websocket:
        # Check that we are tracked in manager
        assert "event-1" in manager.active_connections
        assert len(manager.active_connections["event-1"]) == 1
        
        # Test standard broadcast
        payload = WSEventPayload(
            type=RISK_UPDATED,
            event_id="event-1",
            zone_id="zone-1",
            data={"score": 90.0}
        )
        
        # Trigger publish directly to the broker
        await manager._dispatch_to_sockets("event-1", payload.model_dump())
        
        data = websocket.receive_json()
        assert data["type"] == RISK_UPDATED
        assert data["data"]["score"] == 90.0

@patch("app.api.v1.endpoints.ws.get_user_from_token")
@pytest.mark.anyio
async def test_websocket_auth_filtering(mock_get_user):
    # Connect as CITIZEN
    async def mock_return(*args, **kwargs):
        return get_mock_user(Role.CITIZEN)
    mock_get_user.side_effect = mock_return

    from app.services.pubsub.connection_manager import manager
    
    with client.websocket_connect("/api/v1/ws/events/event-filtered?token=valid_token") as websocket:
        # Test authority-only broadcast
        payload = WSEventPayload(
            type=RECOMMENDATION_APPROVED,
            event_id="event-filtered",
            zone_id="zone-1",
            data={"secret": True}
        )
        
        await manager._dispatch_to_sockets("event-filtered", payload.model_dump())
        
        # We expect the authority message to be dropped.
        # We verify it was filtered by sending a normal message right after and ensuring we receive THAT one first.
        
        # To avoid blocking forever in a test if it fails, we should use a timeout, 
        # but TestClient doesn't support timeout natively easily on receive_json.
        # Instead we verify it was filtered by sending a normal message right after and ensuring we receive THAT one first.
        
        payload_normal = WSEventPayload(
            type=RISK_UPDATED,
            event_id="event-filtered",
            zone_id="zone-1",
            data={"score": 50}
        )
        await manager._dispatch_to_sockets("event-filtered", payload_normal.model_dump())
        
        data = websocket.receive_json()
        assert data["type"] == RISK_UPDATED # The authority message was correctly skipped
