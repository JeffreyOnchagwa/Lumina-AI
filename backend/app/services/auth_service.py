from sqlalchemy.orm import Session
from app.utils.jwt import create_access_token
from app.models.user import User
from app.services.user_service import get_user_by_email
from app.utils.security import verify_password


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    user = get_user_by_email(db, email)

    if user is None:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user

def login_user(
    db: Session,
    email: str,
    password: str,
) -> str | None:
    user = authenticate_user(
        db=db,
        email=email,
        password=password,
    )

    if user is None:
        return None

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return access_token
