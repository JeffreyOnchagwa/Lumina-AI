from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.tts import TTSRequest
from app.services.user_preferences_service import (
    get_or_create_user_preferences,
)
from app.tts.gemini_tts_service import DEFAULT_VOICE, generate_speech


router = APIRouter(
    prefix="/tts",
    tags=["Text to Speech"],
)


@router.post("/generate")
def generate_tts(
    request: TTSRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preferences = get_or_create_user_preferences(
        db=db,
        user_id=current_user.id,
    )

    voice_name = (
        request.voice_name
        or preferences.preferred_voice
        or DEFAULT_VOICE
    )

    if voice_name == "default":
        voice_name = DEFAULT_VOICE

    try:
        audio_bytes = generate_speech(
            text=request.text,
            voice_name=voice_name,
            speech_speed=preferences.speech_speed,
            language=preferences.preferred_language,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to generate speech at this time.",
        ) from exc

    return Response(
        content=audio_bytes,
        media_type="audio/wav",
    )