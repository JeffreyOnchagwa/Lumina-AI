from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    mime_type: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class DocumentDetailResponse(DocumentResponse):
    extracted_text: str