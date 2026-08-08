from pathlib import Path

from app.tts.gemini_tts_service import generate_speech


def test_wav_output():
    audio_bytes = generate_speech(
        "Lumina AI is generating a real WAV audio file."
    )

    output_path = Path("lumina_tts_test.wav")
    output_path.write_bytes(audio_bytes)

    print("WAV file created successfully.")
    print("File path:", output_path.resolve())
    print("File size:", output_path.stat().st_size)


if __name__ == "__main__":
    test_wav_output()