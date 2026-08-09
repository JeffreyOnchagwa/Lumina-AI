from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.dependencies import get_current_user
from app.core.limits import MAX_AUDIO_UPLOAD_BYTES
from app.models.user import User
from app.stt.gemini_stt_service import transcribe_audio


router = APIRouter(
    prefix="/stt",
    tags=["Speech to Text"],
)


ALLOWED_AUDIO_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/webm",
    "audio/ogg",
    "audio/mp4",
    "audio/m4a",
}


@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported audio format.",
        )

    audio_bytes = await file.read(
        MAX_AUDIO_UPLOAD_BYTES + 1
    )

    if not audio_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty.",
        )

    if len(audio_bytes) > MAX_AUDIO_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Audio file is too large. Maximum size is 25 MB.",
        )

    try:
        transcript = transcribe_audio(
            audio_bytes=audio_bytes,
            mime_type=file.content_type,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to transcribe audio at this time.",
        ) from exc

    return {
        "transcript": transcript,
    }