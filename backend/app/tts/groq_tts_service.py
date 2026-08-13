from groq import Groq

from app.core.config import settings


TTS_MODEL = "canopylabs/orpheus-v1-english"
DEFAULT_VOICE = "tara"


def clamp_speech_speed(
    speech_speed: float,
) -> float:
    if speech_speed < 0.5:
        return 0.5

    if speech_speed > 5.0:
        return 5.0

    return speech_speed


def generate_speech(
    text: str,
    voice_name: str = DEFAULT_VOICE,
    speech_speed: float = 1.0,
    language: str = "en",
) -> bytes:
    if not text.strip():
        raise ValueError(
            "Text cannot be empty."
        )

    if not settings.GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    if (
        language
        and not language
        .lower()
        .startswith("en")
    ):
        raise RuntimeError(
            "The current Groq TTS model supports English only."
        )

    client = Groq(
        api_key=settings.GROQ_API_KEY,
        timeout=30.0,
        max_retries=1,
    )

    speed = clamp_speech_speed(
        speech_speed
    )

    try:
        response = (
            client.audio.speech.create(
                model=TTS_MODEL,
                voice=voice_name,
                input=text,
                response_format="wav",
                speed=speed,
            )
        )

    except Exception as exc:
        raise RuntimeError(
            f"Groq TTS request failed: {exc}"
        ) from exc

    try:
        audio_bytes = (
            response.read()
        )

    except Exception as exc:
        raise RuntimeError(
            "Unable to read Groq TTS audio response."
        ) from exc

    if not audio_bytes:
        raise RuntimeError(
            "Groq returned no audio data."
        )

    return audio_bytes