from pydantic import BaseModel, Field


class TTSRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=20000,
    )

    voice_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )


class TTSResponse(BaseModel):
    message: str