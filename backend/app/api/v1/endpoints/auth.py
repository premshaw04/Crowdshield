from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import dependencies
from app.core import security
from app.core.config import settings
from app.models.user import User, Role
from app.repositories.user_repository import UserRepository
from app.schemas.token import Token
from app.schemas.user import UserResponse, UserCreate

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(dependencies.get_db)
) -> Any:
    user_repo = UserRepository(db)
    if user_repo.get_by_email(email=user_in.email):
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # By default, a new user registered via the API gets the role they requested or AUTHORITY
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        role=user_in.role or Role.AUTHORITY
    )
    user = user_repo.create(user)
    return user

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

    # Enforce role-based access to different client apps using OAuth scopes
    requested_scopes = form_data.scopes
    if "authority" in requested_scopes:
        if user.role not in [Role.SUPER_ADMIN, Role.AUTHORITY, Role.OPERATOR, Role.SECURITY_SUPERVISOR]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied. This account does not have Authority privileges."
            )
    elif "citizen" in requested_scopes:
        if user.role != Role.CITIZEN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied. Authority accounts cannot log into the Citizen app."
            )
        
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
