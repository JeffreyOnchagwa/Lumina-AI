from sqlalchemy import text

from app.database.database import engine


def test_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
    except Exception as e:
        print("❌ Database connection failed!")
        print(e)


if __name__ == "__main__":
    test_connection()