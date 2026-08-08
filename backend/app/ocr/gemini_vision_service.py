from google import genai
from google.genai import types

from app.core.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
)


VISION_MODEL = "gemini-3.5-flash"


def extract_text_from_image(
    image_bytes: bytes,
    mime_type: str,
) -> str:
    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type,
    )

    prompt = (
        "Extract all readable text from this image. "
        "Preserve the natural reading order and paragraph structure. "
        "Do not summarize, explain, or add information that is not visible. "
        "Return only the extracted text."
    )

    response = client.models.generate_content(
        model=VISION_MODEL,
        contents=[
            image_part,
            prompt,
        ],
    )

    extracted_text = response.text

    if not extracted_text:
        raise RuntimeError("Gemini returned no extracted text.")

    return extracted_text.strip()