from app.ai.gemini_service import generate_response


def generate_chat_response(
    message: str,
    conversation_history: list[dict[str, str]] | None = None,
) -> str:
    return generate_response(
        message=message,
        conversation_history=conversation_history,
    )