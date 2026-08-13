from app.ai.groq_service import generate_response


def test_groq():
    response = generate_response(
        "Say exactly: Lumina AI connection successful."
    )

    print("Groq response:")
    print(response)


if __name__ == "__main__":
    test_groq()