from app.services.chat_service import generate_chat_response


def test_chat_service():
    response = generate_chat_response(
        "Say exactly: Lumina chat service is working."
    )

    print("Chat service response:")
    print(response)


if __name__ == "__main__":
    test_chat_service()