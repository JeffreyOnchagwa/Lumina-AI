from app.database.database import SessionLocal
from app.services.auth_service import login_user


def test_login():
    db = SessionLocal()

    try:
        access_token = login_user(
            db=db,
            email="jeffrey@example.com",
            password="Password123",
        )

        if access_token:
            print("✅ Login successful!")
            print("JWT token generated successfully.")
        else:
            print("❌ Login failed.")

    finally:
        db.close()


if __name__ == "__main__":
    test_login()