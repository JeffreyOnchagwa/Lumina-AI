from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_memory import UserMemory


def create_memory(
    db: Session,
    user_id: int,
    category: str,
    content: str,
) -> UserMemory:
    memory = UserMemory(
        user_id=user_id,
        category=category,
        content=content,
    )

    db.add(memory)
    db.commit()
    db.refresh(memory)

    return memory


def get_user_memories(
    db: Session,
    user_id: int,
) -> list[UserMemory]:
    statement = (
        select(UserMemory)
        .where(UserMemory.user_id == user_id)
        .order_by(UserMemory.updated_at.desc())
    )

    return list(db.scalars(statement).all())

def get_relevant_memories(
    db: Session,
    user_id: int,
    query: str,
    limit: int = 10,
) -> list[UserMemory]:
    memories = get_user_memories(
        db=db,
        user_id=user_id,
    )

    if not memories:
        return []

    query_words = {
        word.strip(".,!?;:()[]{}\"'").lower()
        for word in query.split()
        if len(word.strip(".,!?;:()[]{}\"'")) >= 3
    }

    scored_memories = []

    for memory in memories:
        memory_text = (
            f"{memory.category} {memory.content}"
        ).lower()

        score = sum(
            1
            for word in query_words
            if word in memory_text
        )

        scored_memories.append(
            (score, memory)
        )

    scored_memories.sort(
        key=lambda item: (
            item[0],
            item[1].updated_at,
        ),
        reverse=True,
    )

    relevant = [
        memory
        for score, memory in scored_memories
        if score > 0
    ]

    # If keyword matching finds nothing, return only a few
    # recent memories instead of injecting the user's entire
    # memory history.
    if not relevant:
        return memories[:3]

    return relevant[:limit]


def find_duplicate_memory(
    db: Session,
    user_id: int,
    category: str,
    content: str,
) -> UserMemory | None:
    normalized_content = content.strip().lower()

    statement = select(UserMemory).where(
        UserMemory.user_id == user_id,
        UserMemory.category == category,
    )

    memories = list(db.scalars(statement).all())

    for memory in memories:
        if memory.content.strip().lower() == normalized_content:
            return memory

    return None


def create_memory_if_new(
    db: Session,
    user_id: int,
    category: str,
    content: str,
) -> UserMemory:
    existing_memory = find_duplicate_memory(
        db=db,
        user_id=user_id,
        category=category,
        content=content,
    )

    if existing_memory is not None:
        return existing_memory

    return create_memory(
        db=db,
        user_id=user_id,
        category=category,
        content=content,
    )


def build_memory_context(
    memories: list[UserMemory],
) -> str:
    if not memories:
        return ""

    memory_lines = [
        f"- [{memory.category}] {memory.content}"
        for memory in memories
    ]

    return (
        "Relevant long-term information about the user:\n"
        + "\n".join(memory_lines)
    )


def delete_memory(
    db: Session,
    memory_id: int,
    user_id: int,
) -> bool:
    statement = select(UserMemory).where(
        UserMemory.id == memory_id,
        UserMemory.user_id == user_id,
    )

    memory = db.scalar(statement)

    if memory is None:
        return False

    db.delete(memory)
    db.commit()

    return True