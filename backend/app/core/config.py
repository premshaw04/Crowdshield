import secrets
from typing import Any, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator, ValidationInfo
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CrowdShield AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode='before')
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    DATABASE_URL: str
    DEMO_ADMIN_EMAIL: str = "authority@crowdshield.ai"
    DEMO_ADMIN_PASSWORD: str = "demo1234"
    
    # Storage
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024 # 5MB
    MAX_VIDEO_UPLOAD_SIZE: int = 500 * 1024 * 1024 # 500MB
    
    # AI Environment
    YOLO_MODEL_PATH: str = "models/yolov8n.pt"
        
    model_config = {
        "case_sensitive": True,
        "env_file": ".env"
    }

settings = Settings()
