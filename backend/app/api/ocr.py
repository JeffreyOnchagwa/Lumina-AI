from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.dependencies import get_current_user
from app.models.user import User
from app.ocr.gemini_vision_service import extract_text_from_image


router = APIRouter(
    prefix="/ocr",
    tags=["OCR"],
)


ALLOWED_IMAGE_TYPES = {
    "image/png",
    "image/jpeg",
}


@router.post("/extract-text")
async def extract_text(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PNG and JPEG images are supported.",
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image is empty.",
        )

    try:
        extracted_text = extract_text_from_image(
            image_bytes=image_bytes,
            mime_type=file.content_type,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to extract text from the image at this time.",
        ) from exc

    return {
        "text": extracted_text,
    }