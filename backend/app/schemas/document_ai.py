from pydantic import BaseModel, Field


class DocumentTextRequest(BaseModel):
    document_text: str = Field(
        ...,
        min_length=1,
        max_length=200000,
    )


class DocumentQuestionRequest(BaseModel):
    document_text: str = Field(
        ...,
        min_length=1,
        max_length=200000,
    )

    question: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )


class SavedDocumentQuestionRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )


class DocumentAIResponse(BaseModel):
    result: str