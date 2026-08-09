from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.memory import (
    MemoryCreateRequest,
    MemoryDeleteResponse,
    MemoryResponse,
)
from app.services.user_memory_service import (
    create_memory,
    delete_memory,
    get_user_memories,
)


router = APIRouter(
    prefix="/memories",
    tags=["Memories"],
)


@router.post(
    "/",
    response_model=MemoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_memory(
    request: MemoryCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_memory(
        db=db,
        user_id=current_user.id,
        category=request.category,
        content=request.content,
    )


@router.get(
    "/",
    response_model=list[MemoryResponse],
)
def list_user_memories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_memories(
        db=db,
        user_id=current_user.id,
    )


@router.delete(
    "/{memory_id}",
    response_model=MemoryDeleteResponse,
)
def remove_user_memory(
    memory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = delete_memory(
        db=db,
        memory_id=memory_id,
        user_id=current_user.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory not found.",
        )

    return MemoryDeleteResponse(
        message="Memory deleted successfully."
    )