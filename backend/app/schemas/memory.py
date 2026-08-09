from datetime import datetime

from pydantic import BaseModel, Field


class MemoryCreateRequest(BaseModel):
    category: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    content: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )


class MemoryResponse(BaseModel):
    id: int
    user_id: int
    category: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class MemoryDeleteResponse(BaseModel):
    message: str