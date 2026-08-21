from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import dependencies
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.token import Token
from app.schemas.user import UserResponse

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(dependencies.get_db),
    # Using OAuth2PasswordRequestForm for standard Swagger support, 
    # but frontend might send JSON instead. If so, a Pydantic model is better.
    # We will accept standard OAuth form data here.
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests"""
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(email=form_data.username)
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=Token)
def refresh_token(
    current_user: User = Depends(dependencies.get_current_user)
) -> Any:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            current_user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": current_user
    }

@router.post("/logout")
def logout() -> Any:
    # MVP: stateless JWT. Client removes token.
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(dependencies.get_current_user),
) -> Any:
    return current_user
