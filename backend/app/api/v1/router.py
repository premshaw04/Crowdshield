from fastapi import APIRouter
from app.core.logging import logger

api_router = APIRouter()

@api_router.get("/health")
def health_check():
    logger.info("Health check endpoint called")
    return {
        "status": "ok",
        "service": "crowdshield-backend"
    }

from sqlalchemy import text
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

@api_router.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return {"status": "error", "message": "Database connection failed"}

from app.api.v1.endpoints import auth, venues, zones, gates, events, videos, routes, recommendations, websockets, alerts, incidents
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(venues.router, prefix="/venues", tags=["venues"])
api_router.include_router(zones.router, prefix="/zones", tags=["zones"])
api_router.include_router(gates.router, prefix="/gates", tags=["gates"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
api_router.include_router(routes.router, prefix="/routes", tags=["routes"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(websockets.router, prefix="/ws", tags=["websockets"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
