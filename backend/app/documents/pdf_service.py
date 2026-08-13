import pymupdf

from app.ocr.groq_vision_service import extract_text_from_image


MIN_TEXT_LENGTH = 20
PDF_RENDER_DPI = 150


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    document = pymupdf.open(
        stream=pdf_bytes,
        filetype="pdf",
    )

    extracted_pages: list[str] = []

    try:
        for page in document:
            page_text = page.get_text("text").strip()

            if len(page_text) >= MIN_TEXT_LENGTH:
                extracted_pages.append(page_text)
                continue

            pixmap = page.get_pixmap(
                dpi=PDF_RENDER_DPI,
                alpha=False,
            )

            image_bytes = pixmap.tobytes("png")

            ocr_text = extract_text_from_image(
                image_bytes=image_bytes,
                mime_type="image/png",
            ).strip()

            if ocr_text:
                extracted_pages.append(ocr_text)

    finally:
        document.close()

    extracted_text = "\n\n".join(extracted_pages).strip()

    if not extracted_text:
        raise RuntimeError(
            "No readable text was found in the PDF."
        )

    return extracted_text