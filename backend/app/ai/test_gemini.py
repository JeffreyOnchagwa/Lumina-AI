from app.ai.gemini_service import generate_response


def test_gemini():
    response = generate_response(
        "Say exactly: Lumina AI connection successful."
    )

    print("Gemini response:")
    print(response)


if __name__ == "__main__":
    test_gemini()