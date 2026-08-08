from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document


def create_document(
    db: Session,
    user_id: int,
    filename: str,
    mime_type: str,
    extracted_text: str,
) -> Document:
    document = Document(
        user_id=user_id,
        filename=filename,
        mime_type=mime_type,
        extracted_text=extracted_text,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_user_document(
    db: Session,
    document_id: int,
    user_id: int,
) -> Document | None:
    statement = select(Document).where(
        Document.id == document_id,
        Document.user_id == user_id,
    )

    return db.scalar(statement)


def get_user_documents(
    db: Session,
    user_id: int,
) -> list[Document]:
    statement = (
        select(Document)
        .where(Document.user_id == user_id)
        .order_by(Document.updated_at.desc())
    )

    return list(db.scalars(statement).all())