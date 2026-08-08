from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.constants import MessageRole
from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage


def create_message(
    db: Session,
    conversation_id: int,
    role: MessageRole,
    content: str,
) -> ConversationMessage:
    message = ConversationMessage(
        conversation_id=conversation_id,
        role=role.value,
        content=content,
    )

    db.add(message)

    conversation = db.get(Conversation, conversation_id)

    if conversation is not None:
        conversation.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(message)

    return message


def get_conversation_messages(
    db: Session,
    conversation_id: int,
) -> list[ConversationMessage]:
    statement = (
        select(ConversationMessage)
        .where(
            ConversationMessage.conversation_id == conversation_id
        )
        .order_by(ConversationMessage.created_at.asc())
    )

    return list(db.scalars(statement).all())