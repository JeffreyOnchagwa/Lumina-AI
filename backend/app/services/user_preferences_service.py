from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_preferences import UserPreferences
from app.schemas.user_preferences import UserPreferencesUpdate


def get_or_create_user_preferences(
    db: Session,
    user_id: int,
) -> UserPreferences:
    statement = select(UserPreferences).where(
        UserPreferences.user_id == user_id
    )

    preferences = db.scalar(statement)

    if preferences is not None:
        return preferences

    preferences = UserPreferences(
        user_id=user_id,
    )

    db.add(preferences)
    db.commit()
    db.refresh(preferences)

    return preferences


def update_user_preferences(
    db: Session,
    user_id: int,
    updates: UserPreferencesUpdate,
) -> UserPreferences:
    preferences = get_or_create_user_preferences(
        db=db,
        user_id=user_id,
    )

    update_data = updates.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    for field, value in update_data.items():
        setattr(preferences, field, value)

    db.commit()
    db.refresh(preferences)

    return preferences