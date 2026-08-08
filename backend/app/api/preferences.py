from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.user_preferences import (
    UserPreferencesResponse,
    UserPreferencesUpdate,
)
from app.services.user_preferences_service import (
    get_or_create_user_preferences,
    update_user_preferences,
)


router = APIRouter(
    prefix="/preferences",
    tags=["Preferences"],
)


@router.get(
    "/",
    response_model=UserPreferencesResponse,
)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_or_create_user_preferences(
        db=db,
        user_id=current_user.id,
    )


@router.patch(
    "/",
    response_model=UserPreferencesResponse,
)
def update_preferences(
    request: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_user_preferences(
        db=db,
        user_id=current_user.id,
        updates=request,
    )