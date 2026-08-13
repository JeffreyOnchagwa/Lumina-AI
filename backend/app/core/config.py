from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # -------------------------------------------------
    # APPLICATION
    # -------------------------------------------------

    APP_NAME: str = "Lumina AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True


    # -------------------------------------------------
    # SECURITY
    # -------------------------------------------------

    SECRET_KEY: str


    # -------------------------------------------------
    # DATABASE
    # -------------------------------------------------

    DATABASE_URL: str = ""


    # -------------------------------------------------
    # GROQ - MAIN AI PROVIDER
    # -------------------------------------------------

    GROQ_API_KEY: str = ""

    # Fast model for simple / everyday requests
    GROQ_FAST_MODEL: str = "openai/gpt-oss-20b"

    # Powerful model for difficult reasoning requests
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    GROQ_REASONING_EFFORT: str = "low"


    # -------------------------------------------------
    # CORS
    # -------------------------------------------------

    CORS_ORIGINS: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )


    # -------------------------------------------------
    # ENVIRONMENT CONFIGURATION
    # -------------------------------------------------

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()