import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.api import dependencies
from app.services.pubsub.connection_manager import manager
from app.core import security
from app.core.config import settings
from jose import jwt
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

async def get_user_from_token(token: str, db: Session) -> Optional[User]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            return db.query(User).filter(User.id == user_id).first()
    except Exception as e:
        logger.warning(f"WS auth failed: {e}")
    return None

@router.websocket("/events/{event_id}")
async def websocket_event_endpoint(
    websocket: WebSocket,
    event_id: str,
    token: str = Query(None),
    db: Session = Depends(dependencies.get_db)
):
    if not token:
        await websocket.close(code=1008) # Policy Violation
        return

    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=1008)
        return

    # In a real app we'd verify the user has access to `event_id` here.
    # For now, if they are a valid user, they can connect to the broadcast.
    
    await manager.connect(websocket, event_id, user)
    
    try:
        while True:
            # We don't expect the client to send messages, just listen.
            # But we must await receive to detect disconnects.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket, event_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(websocket, event_id)
