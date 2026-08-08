from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.constants import MessageRole
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.voice import VoiceConversationResponse
from app.services.chat_service import generate_chat_response
from app.services.conversation_service import (
    create_conversation,
    get_user_conversation,
)
from app.services.message_service import (
    create_message,
    get_conversation_messages,
)
from app.services.user_preferences_service import (
    get_or_create_user_preferences,
)
from app.stt.gemini_stt_service import transcribe_audio
from app.tts.gemini_tts_service import DEFAULT_VOICE, generate_speech
from app.utils.conversation_title import generate_conversation_title


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
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


@router.post(
    "/chat",
    response_model=VoiceConversationResponse,
)
async def voice_chat(
    file: UploadFile = File(...),
    conversation_id: int | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported audio format.",
        )

    audio_bytes = await file.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty.",
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

    if conversation_id is None:
        conversation = create_conversation(
            db=db,
            user_id=current_user.id,
            title=generate_conversation_title(transcript),
        )
    else:
        conversation = get_user_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
        )

        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )

    history_messages = get_conversation_messages(
        db=db,
        conversation_id=conversation.id,
    )

    conversation_history = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in history_messages
    ]

    create_message(
        db=db,
        conversation_id=conversation.id,
        role=MessageRole.USER,
        content=transcript,
    )

    response = generate_chat_response(
        message=transcript,
        conversation_history=conversation_history,
    )

    create_message(
        db=db,
        conversation_id=conversation.id,
        role=MessageRole.MODEL,
        content=response,
    )

    preferences = get_or_create_user_preferences(
        db=db,
        user_id=current_user.id,
    )

    voice_name = (
        preferences.preferred_voice
        or DEFAULT_VOICE
    )

    if voice_name == "default":
        voice_name = DEFAULT_VOICE

    audio_available = False

    try:
        generate_speech(
            text=response,
            voice_name=voice_name,
            speech_speed=preferences.speech_speed,
            language=preferences.preferred_language,
        )

        audio_available = True

    except Exception:
        audio_available = False

    return VoiceConversationResponse(
        transcript=transcript,
        response=response,
        conversation_id=conversation.id,
        audio_available=audio_available,
    )