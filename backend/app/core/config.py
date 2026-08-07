from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Lumina AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    SECRET_KEY: str
    GEMINI_API_KEY: str = ""
    DATABASE_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()