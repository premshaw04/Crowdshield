import logging
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from app.models.user import User, Role
from app.services.pubsub.broker import broker
from app.services.pubsub.events import AUTHORITY_ONLY_TYPES

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps event_id -> list of (WebSocket, User) tuples
        self.active_connections: Dict[str, List[tuple[WebSocket, User]]] = {}
        # We need to keep a reference to the broker callback we register per event
        # so we don't leak callbacks if no one is listening.
        self._broker_callbacks: Dict[str, any] = {}

    async def connect(self, websocket: WebSocket, event_id: str, user: User):
        await websocket.accept()
        if event_id not in self.active_connections:
            self.active_connections[event_id] = []
            
            # Register broker callback for this event_id exactly once
            async def _callback(message: dict):
                await self._dispatch_to_sockets(event_id, message)
            
            self._broker_callbacks[event_id] = _callback
            await broker.subscribe(event_id, _callback)

        self.active_connections[event_id].append((websocket, user))
        logger.info(f"User {user.id} ({user.role.value}) connected to WS event {event_id}")

    async def disconnect(self, websocket: WebSocket, event_id: str):
        if event_id in self.active_connections:
            # Remove the specific socket
            self.active_connections[event_id] = [
                (ws, u) for (ws, u) in self.active_connections[event_id] if ws != websocket
            ]
            
            # If no one is listening to this event anymore, clean up
            if not self.active_connections[event_id]:
                del self.active_connections[event_id]
                if event_id in self._broker_callbacks:
                    await broker.unsubscribe(event_id, self._broker_callbacks[event_id])
                    del self._broker_callbacks[event_id]
        logger.info(f"WebSocket disconnected from event {event_id}")

    async def _dispatch_to_sockets(self, event_id: str, message: dict):
        if event_id not in self.active_connections:
            return

        msg_type = message.get("type")
        is_authority_only = msg_type in AUTHORITY_ONLY_TYPES
        
        # Need to handle dead connections during iteration
        dead_sockets = []
        
        for ws, user in self.active_connections[event_id]:
            # Apply RBAC filtering
            if is_authority_only and user.role not in [Role.AUTHORITY, Role.SUPER_ADMIN]:
                continue
                
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending to WS, marking for removal: {e}")
                dead_sockets.append(ws)
                
        # Cleanup any dead sockets that raised exceptions
        for ws in dead_sockets:
            await self.disconnect(ws, event_id)

manager = ConnectionManager()
