from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.constants import MessageRole
from app.core.limits import MAX_CONVERSATION_HISTORY_MESSAGES
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import generate_chat_response
from app.services.conversation_service import (
    create_conversation,
    get_user_conversation,
)
from app.services.message_service import (
    create_message,
    get_conversation_messages,
)
from app.services.user_memory_service import (
    build_memory_context,
    get_relevant_memories,
)
from app.utils.conversation_title import generate_conversation_title


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post(
    "/",
    response_model=ChatResponse,
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -------------------------------------------------
    # GET OR CREATE CONVERSATION
    # -------------------------------------------------

    if request.conversation_id is None:
        conversation = create_conversation(
            db=db,
            user_id=current_user.id,
            title=generate_conversation_title(
                request.message
            ),
        )

    else:
        conversation = get_user_conversation(
            db=db,
            conversation_id=request.conversation_id,
            user_id=current_user.id,
        )

        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )

    # -------------------------------------------------
    # LOAD CONVERSATION HISTORY
    # -------------------------------------------------

    history_messages = get_conversation_messages(
        db=db,
        conversation_id=conversation.id,
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
    # LOAD EXISTING LONG-TERM MEMORIES
    # -------------------------------------------------

    memories = get_relevant_memories(
        db=db,
        user_id=current_user.id,
        query=request.message,
    )

    memory_context = build_memory_context(
        memories
    )

    if memory_context:
        conversation_history.insert(
            0,
            {
                "role": "user",
                "content": (
                    "Use the following long-term user information "
                    "when it is relevant to the current request. "
                    "Do not mention that this information came from "
                    "memory unless the user asks.\n\n"
                    f"{memory_context}"
                ),
            },
        )

        conversation_history.insert(
            1,
            {
                "role": "model",
                "content": (
                    "Understood. I will use that information "
                    "only when relevant."
                ),
            },
        )

    # -------------------------------------------------
    # SAVE USER MESSAGE
    # -------------------------------------------------

    create_message(
        db=db,
        conversation_id=conversation.id,
        role=MessageRole.USER,
        content=request.message,
    )

    # -------------------------------------------------
    # GENERATE GROQ RESPONSE
    # -------------------------------------------------

    response = generate_chat_response(
        message=request.message,
        conversation_history=conversation_history,
    )

    # -------------------------------------------------
    # SAVE ASSISTANT RESPONSE
    # -------------------------------------------------

    create_message(
        db=db,
        conversation_id=conversation.id,
        role=MessageRole.MODEL,
        content=response,
    )

    # -------------------------------------------------
    # RETURN RESPONSE IMMEDIATELY
    #
    # Automatic memory extraction is temporarily
    # disabled here because it caused a second AI call
    # before the user received the response.
    #
    # We will restore it as a background task later.
    # -------------------------------------------------

    return ChatResponse(
        response=response,
        conversation_id=conversation.id,
    )