from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.database.dependencies import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import login_user
from app.services.user_service import create_user

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return create_user(db, user)

@router.post("/login", response_model=TokenResponse)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    access_token = login_user(
        db=db,
        email=credentials.email,
        password=credentials.password,
    )

    if access_token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
@router.get("/me", response_model=UserResponse)
def get_me(
    current_user=Depends(get_current_user),
):
    return current_user