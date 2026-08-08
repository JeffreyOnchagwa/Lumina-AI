import io
import wave

from google import genai
from google.genai import types

from app.core.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
)


TTS_MODEL = "gemini-3.1-flash-tts-preview"
DEFAULT_VOICE = "Kore"

AUDIO_CHANNELS = 1
AUDIO_SAMPLE_RATE = 24000
AUDIO_SAMPLE_WIDTH = 2


def pcm_to_wav(pcm_data: bytes) -> bytes:
    buffer = io.BytesIO()

    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(AUDIO_CHANNELS)
        wav_file.setsampwidth(AUDIO_SAMPLE_WIDTH)
        wav_file.setframerate(AUDIO_SAMPLE_RATE)
        wav_file.writeframes(pcm_data)

    return buffer.getvalue()


def get_pace_instruction(speech_speed: float) -> str:
    if speech_speed <= 0.7:
        return "Speak very slowly and clearly."

    if speech_speed <= 0.9:
        return "Speak slowly and clearly."

    if speech_speed <= 1.1:
        return "Speak at a natural, comfortable pace."

    if speech_speed <= 1.4:
        return "Speak slightly faster than normal while remaining clear."

    return "Speak quickly while maintaining clear pronunciation."


def generate_speech(
    text: str,
    voice_name: str = DEFAULT_VOICE,
    speech_speed: float = 1.0,
    language: str = "en",
) -> bytes:
    pace_instruction = get_pace_instruction(speech_speed)

    prompt = (
        f"{pace_instruction}\n"
        f"Use the language identified by this language code: {language}.\n"
        "Pronounce the text naturally and clearly.\n"
        "Read the following text exactly as written:\n\n"
        f"{text}"
    )

    response = client.models.generate_content(
        model=TTS_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice_name,
                    )
                )
            ),
        ),
    )

    pcm_data = response.candidates[0].content.parts[0].inline_data.data

    if not pcm_data:
        raise RuntimeError("Gemini returned no audio data.")

    return pcm_to_wav(pcm_data)