from pydantic import BaseModel


class VoiceConversationResponse(BaseModel):
    transcript: str
    response: str
    conversation_id: int
    audio_available: bool