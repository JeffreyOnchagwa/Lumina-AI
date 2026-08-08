from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.constants import MessageRole
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

    return ChatResponse(
        response=response,
        conversation_id=conversation.id,
    )