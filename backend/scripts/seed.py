import sys
import os

# Add the root directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.user import User, Role
from app.core.security import get_password_hash
from app.core.config import settings

def seed_db():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
        if not user:
            print(f"Creating demo user: {settings.DEMO_ADMIN_EMAIL}")
            user = User(
                name="Demo Authority",
                email=settings.DEMO_ADMIN_EMAIL,
                password_hash=get_password_hash(settings.DEMO_ADMIN_PASSWORD),
                role=Role.AUTHORITY,
                is_active=True
            )
            db.add(user)
            db.commit()
            print("Demo user created successfully.")
        else:
            print(f"Demo user {settings.DEMO_ADMIN_EMAIL} already exists.")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
