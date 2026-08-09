from fastapi import FastAPI

from app.api.users import router as users_router
from app.api.chat import router as chat_router
from app.api.conversations import router as conversations_router
from app.api.preferences import router as preferences_router
from app.api.tts import router as tts_router
from app.api.ocr import router as ocr_router
from app.api.documents import router as documents_router
from app.api.stt import router as stt_router
from app.api.voice import router as voice_router
from app.api.memories import router as memories_router
from app.core.config import settings


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} Backend!"
    }


app.include_router(users_router)
app.include_router(chat_router)
app.include_router(conversations_router)
app.include_router(preferences_router)
app.include_router(tts_router)
app.include_router(ocr_router)
app.include_router(documents_router)
app.include_router(stt_router)
app.include_router(voice_router)
app.include_router(memories_router)