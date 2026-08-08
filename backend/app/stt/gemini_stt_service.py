from google import genai
from google.genai import types

from app.core.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
)


STT_MODEL = "gemini-3.5-flash"


def transcribe_audio(
    audio_bytes: bytes,
    mime_type: str,
) -> str:
    audio_part = types.Part.from_bytes(
        data=audio_bytes,
        mime_type=mime_type,
    )

    prompt = (
        "Transcribe the speech in this audio accurately. "
        "Return only the spoken words as plain text. "
        "Do not summarize, explain, or add commentary."
    )

    response = client.models.generate_content(
        model=STT_MODEL,
        contents=[
            audio_part,
            prompt,
        ],
    )

    transcript = response.text

    if not transcript:
        raise RuntimeError(
            "Gemini returned no transcription."
        )

    return transcript.strip()