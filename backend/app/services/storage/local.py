import os
import uuid
from pathlib import Path
from app.services.storage.base import StorageProvider
from app.core.config import settings
from app.core.logging import logger

class LocalStorageProvider(StorageProvider):
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_content: bytes, file_name: str) -> str:
        # Create a unique filename to prevent collisions
        ext = os.path.splitext(file_name)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = self.upload_dir / unique_name
        
        with open(file_path, "wb") as f:
            f.write(file_content)
            
        logger.info(f"Saved local file to {file_path}")
        return unique_name

    def delete_file(self, file_key: str) -> bool:
        file_path = self.upload_dir / file_key
        if file_path.exists():
            file_path.unlink()
            logger.info(f"Deleted local file at {file_path}")
            return True
        logger.warning(f"Failed to delete {file_path}: File not found")
        return False

    def get_url(self, file_key: str) -> str:
        # Assuming static mounting at /uploads
        return f"/uploads/{file_key}"
