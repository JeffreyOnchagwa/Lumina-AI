from pydantic import BaseModel, Field


class UserPreferencesUpdate(BaseModel):
    preferred_voice: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    speech_speed: float | None = Field(
        default=None,
        ge=0.5,
        le=2.0,
    )

    font_size: int | None = Field(
        default=None,
        ge=12,
        le=48,
    )

    dyslexia_mode: bool | None = None

    high_contrast_mode: bool | None = None

    preferred_language: str | None = Field(
        default=None,
        min_length=2,
        max_length=20,
    )


class UserPreferencesResponse(BaseModel):
    id: int
    user_id: int
    preferred_voice: str
    speech_speed: float
    font_size: int
    dyslexia_mode: bool
    high_contrast_mode: bool
    preferred_language: str

    model_config = {
        "from_attributes": True,
    }