import os
import tempfile
from pathlib import Path

from groq import Groq

from app.core.config import settings


STT_MODEL = "whisper-large-v3-turbo"


MIME_TYPE_EXTENSIONS = {
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/mp4": ".m4a",
    "audio/m4a": ".m4a",
}


def transcribe_audio(
    audio_bytes: bytes,
    mime_type: str,
) -> str:
    if not audio_bytes:
        raise ValueError(
            "Audio data cannot be empty."
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

    suffix = MIME_TYPE_EXTENSIONS.get(
        normalized_mime_type,
        ".webm",
    )

    temp_path: str | None = None

    client = Groq(
        api_key=settings.GROQ_API_KEY,
        timeout=30.0,
        max_retries=1,
    )

    try:
        with tempfile.NamedTemporaryFile(
            suffix=suffix,
            delete=False,
        ) as temp_file:
            temp_file.write(
                audio_bytes
            )

            temp_path = (
                temp_file.name
            )

        with open(
            temp_path,
            "rb",
        ) as audio_file:
            transcription = (
                client.audio.transcriptions.create(
                    file=(
                        Path(temp_path).name,
                        audio_file.read(),
                    ),
                    model=STT_MODEL,
                    response_format="json",
                    temperature=0.0,
                )
            )

        transcript = (
            transcription.text
            or ""
        ).strip()

        if not transcript:
            raise RuntimeError(
                "No speech was detected in the audio."
            )

        return transcript

    except Exception as exc:
        raise RuntimeError(
            f"Groq speech transcription failed: {exc}"
        ) from exc

    finally:
        if temp_path:
            path = Path(
                temp_path
            )

            if path.exists():
                try:
                    os.remove(
                        temp_path
                    )
                except OSError:
                    pass