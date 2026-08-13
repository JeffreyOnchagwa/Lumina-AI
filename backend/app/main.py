

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
from app.core.logging import configure_logging


configure_logging()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

cors_origins_env = settings.CORS_ORIGINS

production_origins = [
    origin.strip()
    for origin in cors_origins_env.split(",")
    if origin.strip()
]

allowed_origins = list(
    dict.fromkeys(
        default_origins
        + production_origins
    )
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# BASIC ROUTES
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": (
            f"Welcome to "
            f"{settings.APP_NAME} Backend!"
        )
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# ---------------------------------------------------------
# API ROUTERS
# ---------------------------------------------------------

app.include_router(
    users_router
)

app.include_router(
    chat_router
)

app.include_router(
    conversations_router
)

app.include_router(
    preferences_router
)

app.include_router(
    tts_router
)

app.include_router(
    ocr_router
)

app.include_router(
    documents_router
)

app.include_router(
    stt_router
)

app.include_router(
    voice_router
)

app.include_router(
    memories_router
)