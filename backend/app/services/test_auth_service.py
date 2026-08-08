from app.database.database import SessionLocal
from app.services.auth_service import authenticate_user


def test_authentication():
    db = SessionLocal()

    try:
        user = authenticate_user(
            db=db,
            email="jeffrey@example.com",
            password="Password123",
        )

        if user:
            print("✅ Authentication successful!")
            print(f"Authenticated user: {user.email}")
        else:
            print("❌ Authentication failed!")

    finally:
        db.close()


if __name__ == "__main__":
    test_authentication()