import json
from typing import Dict, List, Optional
from fastapi import WebSocket
from app.core.logging import logger

class ConnectionManager:
    def __init__(self):
        # Maps zone_id -> list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # We can also keep a global list for venue-wide broadcasts
        self.all_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, zone_id: Optional[str] = None):
        await websocket.accept()
        self.all_connections.append(websocket)
        
        if zone_id:
            if zone_id not in self.active_connections:
                self.active_connections[zone_id] = []
            self.active_connections[zone_id].append(websocket)
            logger.info(f"Client connected to zone {zone_id}")
        else:
            logger.info("Client connected globally")

    def disconnect(self, websocket: WebSocket, zone_id: Optional[str] = None):
        if websocket in self.all_connections:
            self.all_connections.remove(websocket)
            
        if zone_id and zone_id in self.active_connections:
            if websocket in self.active_connections[zone_id]:
                self.active_connections[zone_id].remove(websocket)
            if not self.active_connections[zone_id]:
                del self.active_connections[zone_id]

    async def broadcast_to_zone(self, zone_id: str, message: dict):
        """Broadcast a message to all clients in a specific zone"""
        if zone_id in self.active_connections:
            for connection in self.active_connections[zone_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to client in zone {zone_id}: {e}")
                    self.disconnect(connection, zone_id)

    async def broadcast_to_all(self, message: dict):
        """Broadcast a message to all connected clients"""
        for connection in self.all_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting globally: {e}")
                self.disconnect(connection)

manager = ConnectionManager()
