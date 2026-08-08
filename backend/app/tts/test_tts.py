from app.tts.gemini_tts_service import generate_speech


def test_tts():
    audio_bytes = generate_speech(
        "Lumina AI text to speech is working."
    )

    print("Audio generated:", bool(audio_bytes))
    print("Audio byte length:", len(audio_bytes))


if __name__ == "__main__":
    test_tts()