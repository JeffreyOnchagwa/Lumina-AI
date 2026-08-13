from time import perf_counter

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.constants import MessageRole
from app.core.limits import (
    MAX_AUDIO_UPLOAD_BYTES,
    MAX_CONVERSATION_HISTORY_MESSAGES,
)
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
from app.stt.whisper_stt_service import transcribe_audio
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


def normalize_audio_content_type(
    content_type: str | None,
) -> str:
    if not content_type:
        return ""

    return (
        content_type
        .split(";")[0]
        .strip()
        .lower()
    )


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
    total_start = perf_counter()

    print(
        "\n"
        "========================================"
    )

    print(
        "[LUMINA VOICE] Request started"
    )

    print(
        "========================================"
    )

    # -------------------------------------------------
    # 1. VALIDATE AUDIO TYPE
    # -------------------------------------------------

    normalized_content_type = (
        normalize_audio_content_type(
            file.content_type
        )
    )

    if (
        normalized_content_type
        not in ALLOWED_AUDIO_TYPES
    ):
        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported audio format: "
                f"{file.content_type}"
            ),
        )

    # -------------------------------------------------
    # 2. READ AUDIO
    # -------------------------------------------------

    audio_read_start = perf_counter()

    audio_bytes = await file.read(
        MAX_AUDIO_UPLOAD_BYTES + 1
    )

    audio_read_time = (
        perf_counter()
        - audio_read_start
    )

    print(
        "[LUMINA VOICE] "
        f"Audio read: {audio_read_time:.2f}s"
    )

    print(
        "[LUMINA VOICE] "
        f"Audio size: {len(audio_bytes)} bytes"
    )

    print(
        "[LUMINA VOICE] "
        f"Audio type: {normalized_content_type}"
    )

    if not audio_bytes:
        raise HTTPException(
            status_code=
                status.HTTP_400_BAD_REQUEST,
            detail=(
                "Uploaded audio file is empty."
            ),
        )

    if (
        len(audio_bytes)
        > MAX_AUDIO_UPLOAD_BYTES
    ):
        raise HTTPException(
            status_code=
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                "Audio file is too large."
            ),
        )

    # -------------------------------------------------
    # 3. SPEECH TO TEXT
    # -------------------------------------------------

    print(
        "[LUMINA VOICE] "
        "Starting transcription..."
    )

    stt_start = perf_counter()

    try:
        transcript = transcribe_audio(
            audio_bytes=audio_bytes,
            mime_type=
                normalized_content_type,
        )

    except Exception as exc:
        stt_time = (
            perf_counter()
            - stt_start
        )

        print(
            "[LUMINA VOICE] "
            f"STT FAILED after {stt_time:.2f}s"
        )

        print(
            "VOICE TRANSCRIPTION ERROR:",
            repr(exc),
        )

        raise HTTPException(
            status_code=
                status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Unable to transcribe audio: "
                f"{exc}"
            ),
        ) from exc

    stt_time = (
        perf_counter()
        - stt_start
    )

    print(
        "[LUMINA VOICE] "
        f"STT completed: {stt_time:.2f}s"
    )

    print(
        "[LUMINA VOICE] "
        f"Transcript: {transcript}"
    )

    # -------------------------------------------------
    # 4. CREATE OR LOAD CONVERSATION
    # -------------------------------------------------

    database_start = perf_counter()

    if conversation_id is None:
        conversation = create_conversation(
            db=db,
            user_id=current_user.id,
            title=
                generate_conversation_title(
                    transcript
                ),
        )

    else:
        conversation = (
            get_user_conversation(
                db=db,
                conversation_id=
                    conversation_id,
                user_id=current_user.id,
            )
        )

        if conversation is None:
            raise HTTPException(
                status_code=
                    status.HTTP_404_NOT_FOUND,
                detail=(
                    "Conversation not found."
                ),
            )

    # -------------------------------------------------
    # 5. LOAD CONVERSATION HISTORY
    # -------------------------------------------------

    history_messages = (
        get_conversation_messages(
            db=db,
            conversation_id=
                conversation.id,
        )
    )

    history_messages = history_messages[
        -MAX_CONVERSATION_HISTORY_MESSAGES:
    ]

    conversation_history = [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in history_messages
    ]

    # -------------------------------------------------
    # 6. SAVE TRANSCRIBED USER MESSAGE
    # -------------------------------------------------

    create_message(
        db=db,
        conversation_id=
            conversation.id,
        role=MessageRole.USER,
        content=transcript,
    )

    database_before_ai_time = (
        perf_counter()
        - database_start
    )

    print(
        "[LUMINA VOICE] "
        "Database before AI: "
        f"{database_before_ai_time:.2f}s"
    )

    # -------------------------------------------------
    # 7. GENERATE AI RESPONSE
    # -------------------------------------------------

    print(
        "[LUMINA VOICE] "
        "Starting AI response..."
    )

    ai_start = perf_counter()

    try:
        response = (
            generate_chat_response(
                message=transcript,
                conversation_history=
                    conversation_history,
            )
        )

    except Exception as exc:
        ai_time = (
            perf_counter()
            - ai_start
        )

        print(
            "[LUMINA VOICE] "
            f"AI FAILED after {ai_time:.2f}s"
        )

        print(
            "VOICE AI RESPONSE ERROR:",
            repr(exc),
        )

        raise HTTPException(
            status_code=
                status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Unable to generate AI response: "
                f"{exc}"
            ),
        ) from exc

    ai_time = (
        perf_counter()
        - ai_start
    )

    print(
        "[LUMINA VOICE] "
        f"AI completed: {ai_time:.2f}s"
    )

    # -------------------------------------------------
    # 8. SAVE AI RESPONSE
    # -------------------------------------------------

    save_response_start = (
        perf_counter()
    )

    create_message(
        db=db,
        conversation_id=
            conversation.id,
        role=MessageRole.MODEL,
        content=response,
    )

    save_response_time = (
        perf_counter()
        - save_response_start
    )

    print(
        "[LUMINA VOICE] "
        "Save AI response: "
        f"{save_response_time:.2f}s"
    )

    # -------------------------------------------------
    # 9. TOTAL TIME
    # -------------------------------------------------

    total_time = (
        perf_counter()
        - total_start
    )

    print(
        "----------------------------------------"
    )

    print(
        "[LUMINA VOICE] "
        f"STT: {stt_time:.2f}s"
    )

    print(
        "[LUMINA VOICE] "
        f"Database: "
        f"{database_before_ai_time:.2f}s"
    )

    print(
        "[LUMINA VOICE] "
        f"AI: {ai_time:.2f}s"
    )

    print(
        "[LUMINA VOICE] "
        f"Save response: "
        f"{save_response_time:.2f}s"
    )

    print(
        "[LUMINA VOICE] "
        f"TOTAL: {total_time:.2f}s"
    )

    print(
        "========================================"
        "\n"
    )

    # -------------------------------------------------
    # 10. RETURN RESPONSE
    # -------------------------------------------------

    return VoiceConversationResponse(
        transcript=transcript,
        response=response,
        conversation_id=
            conversation.id,
        audio_available=True,
    )