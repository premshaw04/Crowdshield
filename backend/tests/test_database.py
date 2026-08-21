from sqlalchemy import text
from app.core.database import SessionLocal

def test_database_connection():
    db = SessionLocal()
    try:
        # Simple test query to ensure connection is working
        result = db.execute(text("SELECT 1"))
        assert result.scalar() == 1
    finally:
        db.close()
