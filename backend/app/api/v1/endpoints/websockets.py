from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Path
from typing import Optional
from app.websockets.manager import manager
from app.core.logging import logger

router = APIRouter()

@router.websocket("/client/{client_id}")
@router.websocket("/client/{client_id}/{zone_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: str = Path(...), 
    zone_id: Optional[str] = None
):
    await manager.connect(websocket, zone_id)
    try:
        while True:
            # We don't necessarily expect messages from the client in this flow,
            # but we need to keep the connection open and handle incoming ping/pong.
            data = await websocket.receive_text()
            logger.debug(f"Received message from client {client_id}: {data}")
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
        manager.disconnect(websocket, zone_id)
