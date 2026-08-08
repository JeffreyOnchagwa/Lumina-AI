from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.dependencies import get_db
from app.documents.pdf_service import extract_text_from_pdf
from app.models.user import User
from app.schemas.document import (
    DocumentDetailResponse,
    DocumentResponse,
)
from app.schemas.document_ai import (
    DocumentAIResponse,
    DocumentQuestionRequest,
    DocumentTextRequest,
    SavedDocumentQuestionRequest,
)
from app.services.document_ai_service import (
    answer_document_question,
    simplify_document,
    summarize_document,
)
from app.services.document_service import (
    create_document,
    get_user_document,
    get_user_documents,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/upload",
    response_model=DocumentDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )

    pdf_bytes = await file.read()

    if not pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded PDF is empty.",
        )

    try:
        extracted_text = extract_text_from_pdf(pdf_bytes)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to process the PDF at this time.",
        ) from exc

    document = create_document(
        db=db,
        user_id=current_user.id,
        filename=file.filename or "document.pdf",
        mime_type=file.content_type,
        extracted_text=extracted_text,
    )

    return document


@router.get(
    "/",
    response_model=list[DocumentResponse],
)
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_documents(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentDetailResponse,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_user_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return document


@router.post(
    "/{document_id}/summarize",
    response_model=DocumentAIResponse,
)
def summarize_saved_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_user_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    try:
        result = summarize_document(
            document.extracted_text
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to summarize the document at this time.",
        ) from exc

    return DocumentAIResponse(
        result=result,
    )


@router.post(
    "/{document_id}/simplify",
    response_model=DocumentAIResponse,
)
def simplify_saved_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_user_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    try:
        result = simplify_document(
            document.extracted_text
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to simplify the document at this time.",
        ) from exc

    return DocumentAIResponse(
        result=result,
    )


@router.post(
    "/{document_id}/ask",
    response_model=DocumentAIResponse,
)
def ask_saved_document(
    document_id: int,
    request: SavedDocumentQuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = get_user_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    try:
        result = answer_document_question(
            document_text=document.extracted_text,
            question=request.question,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to answer the document question at this time.",
        ) from exc

    return DocumentAIResponse(
        result=result,
    )


@router.post(
    "/summarize",
    response_model=DocumentAIResponse,
)
def summarize_document_text(
    request: DocumentTextRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        result = summarize_document(
            request.document_text
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to summarize the document at this time.",
        ) from exc

    return DocumentAIResponse(
        result=result,
    )


@router.post(
    "/simplify",
    response_model=DocumentAIResponse,
)
def simplify_document_text(
    request: DocumentTextRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        result = simplify_document(
            request.document_text
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to simplify the document at this time.",
        ) from exc

    return DocumentAIResponse(
        result=result,
    )


@router.post(
    "/ask",
    response_model=DocumentAIResponse,
)
def ask_document_question(
    request: DocumentQuestionRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        result = answer_document_question(
            document_text=request.document_text,
            question=request.question,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to answer the document question at this time.",
        ) from exc

    return DocumentAIResponse(
        result=result,
    )