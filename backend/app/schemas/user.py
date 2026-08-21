from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import Role

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[Role] = Role.AUTHORITY
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
