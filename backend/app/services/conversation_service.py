from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.conversation import Conversation


def create_conversation(
    db: Session,
    user_id: int,
    title: str | None = None,
) -> Conversation:
    conversation = Conversation(
        user_id=user_id,
        title=title,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_user_conversation(
    db: Session,
    conversation_id: int,
    user_id: int,
) -> Conversation | None:
    statement = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id,
    )

    return db.scalar(statement)


def get_user_conversations(
    db: Session,
    user_id: int,
) -> list[Conversation]:
    statement = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )

    return list(db.scalars(statement).all())


def update_conversation_title(
    db: Session,
    conversation_id: int,
    user_id: int,
    title: str,
) -> Conversation | None:
    conversation = get_user_conversation(
        db=db,
        conversation_id=conversation_id,
        user_id=user_id,
    )

    if conversation is None:
        return None

    conversation.title = title

    db.commit()
    db.refresh(conversation)

    return conversation


def delete_conversation(
    db: Session,
    conversation_id: int,
    user_id: int,
) -> bool:
    conversation = get_user_conversation(
        db=db,
        conversation_id=conversation_id,
        user_id=user_id,
    )

    if conversation is None:
        return False

    db.delete(conversation)
    db.commit()

    return True