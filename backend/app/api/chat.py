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
from app.services.memory_extraction_service import (
    extract_memory_from_message,
)
from app.services.message_service import (
    create_message,
    get_conversation_messages,
)
from app.services.user_memory_service import (
    build_memory_context,
    create_memory_if_new,
    get_relevant_memories,
)
from app.utils.conversation_title import generate_conversation_title


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if request.conversation_id is None:
        conversation = create_conversation(
            db=db,
            user_id=current_user.id,
            title=generate_conversation_title(request.message),
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

    memories = get_relevant_memories(
        db=db,
        user_id=current_user.id,
        query=request.message,
    )

    memory_context = build_memory_context(memories)

    if memory_context:
        conversation_history.insert(
            0,
            {
                "role": "user",
                "content": (
                    "Use the following long-term user information "
                    "when it is relevant to the current request. "
                    "Do not mention that this information came from memory "
                    "unless the user asks.\n\n"
                    f"{memory_context}"
                ),
            },
        )

        conversation_history.insert(
            1,
            {
                "role": "model",
                "content": (
                    "Understood. I will use that information only when relevant."
                ),
            },
        )

    create_message(
        db=db,
        conversation_id=conversation.id,
        role=MessageRole.USER,
        content=request.message,
    )

    response = generate_chat_response(
        message=request.message,
        conversation_history=conversation_history,
    )

    create_message(
        db=db,
        conversation_id=conversation.id,
        role=MessageRole.MODEL,
        content=response,
    )

    try:
        extracted_memory = extract_memory_from_message(
            request.message
        )

        if extracted_memory is not None:
            create_memory_if_new(
                db=db,
                user_id=current_user.id,
                category=extracted_memory["category"],
                content=extracted_memory["content"],
            )

    except Exception:
        # Memory extraction should never cause the main
        # chat request to fail.
        pass

    return ChatResponse(
        response=response,
        conversation_id=conversation.id,
    )