import base64

from groq import Groq

from app.core.config import settings


VISION_MODEL = "qwen/qwen3.6-27b"


def extract_text_from_image(
    image_bytes: bytes,
    mime_type: str,
) -> str:
    if not image_bytes:
        raise ValueError(
            "Image data cannot be empty."
        )

    if not settings.GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    normalized_mime_type = (
        mime_type
        .split(";")[0]
        .strip()
        .lower()
    )

    if normalized_mime_type not in {
        "image/png",
        "image/jpeg",
    }:
        raise ValueError(
            "Unsupported image type."
        )

    encoded_image = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    data_url = (
        f"data:{normalized_mime_type};"
        f"base64,{encoded_image}"
    )

    client = Groq(
        api_key=settings.GROQ_API_KEY,
        timeout=30.0,
        max_retries=1,
    )

    prompt = (
        "Extract all readable text from this image. "
        "Preserve the natural reading order and paragraph structure. "
        "Do not summarize, explain, interpret, or add information. "
        "Return only text that is visible in the image."
    )

    try:
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt,
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": data_url,
                            },
                        },
                    ],
                }
            ],
            temperature=0,
            max_completion_tokens=2000,
            stream=False,
        )

    except Exception as exc:
        raise RuntimeError(
            f"Groq vision request failed: {exc}"
        ) from exc

    if not response.choices:
        raise RuntimeError(
            "Groq returned no vision response."
        )

    extracted_text = (
        response
        .choices[0]
        .message
        .content
    )

    if not extracted_text:
        raise RuntimeError(
            "Groq returned no extracted text."
        )

    return extracted_text.strip()