from groq import Groq

from app.core.config import settings


def build_messages(
    message: str,
    conversation_history: list[dict[str, str]] | None = None,
) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = []

    if conversation_history:
        for item in conversation_history:
            role = item.get("role", "")
            content = item.get("content", "")

            if not content:
                continue

            if role == "model":
                role = "assistant"

            if role not in {
                "system",
                "user",
                "assistant",
            }:
                continue

            messages.append(
                {
                    "role": role,
                    "content": content,
                }
            )

    messages.append(
        {
            "role": "user",
            "content": message,
        }
    )

    return messages


def should_use_powerful_model(
    message: str,
) -> bool:
    """
    Decide whether a request needs the larger GPT-OSS-120B model.

    This uses local rules only, so routing itself adds essentially
    no latency and does not consume Groq tokens.
    """

    text = message.strip().lower()

    # Longer prompts are more likely to need deeper reasoning.
    if len(text) >= 500:
        return True

    difficult_phrases = (
        "explain why",
        "explain in depth",
        "analyze",
        "analyse",
        "derive",
        "prove",
        "proof",
        "solve",
        "calculate",
        "reason",
        "reasoning",
        "compare and contrast",
        "evaluate",
        "critically",
        "debug",
        "fix this code",
        "write code",
        "program",
        "algorithm",
        "time complexity",
        "machine learning",
        "research",
        "statistics",
        "probability",
        "physics",
        "quantum",
        "chemistry",
        "biochemistry",
        "medical",
        "medicine",
        "diagnosis",
        "differential diagnosis",
        "pathophysiology",
        "pharmacology",
        "mathematics",
        "equation",
        "architecture",
        "database design",
        "system design",
        "step by step",
    )

    if any(
        phrase in text
        for phrase in difficult_phrases
    ):
        return True

    return False


def choose_model(
    message: str,
) -> str:
    if should_use_powerful_model(
        message
    ):
        return settings.GROQ_MODEL

    return settings.GROQ_FAST_MODEL


def generate_response(
    message: str,
    conversation_history: list[dict[str, str]] | None = None,
) -> str:
    if not settings.GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    messages = build_messages(
        message=message,
        conversation_history=conversation_history,
    )

    selected_model = choose_model(
        message
    )

    client = Groq(
        api_key=settings.GROQ_API_KEY,
        timeout=30.0,
        max_retries=1,
    )

    # Fast everyday requests need shorter outputs.
    if selected_model == settings.GROQ_FAST_MODEL:
        max_tokens = 700
    else:
        max_tokens = 1400

    try:
        response = client.chat.completions.create(
            model=selected_model,
            messages=messages,
            reasoning_effort=settings.GROQ_REASONING_EFFORT,
            max_completion_tokens=max_tokens,
            include_reasoning=False,
            stream=False,
        )

    except Exception as exc:
        raise RuntimeError(
            f"Groq AI request failed: {exc}"
        ) from exc

    if not response.choices:
        raise RuntimeError(
            "Groq returned no response."
        )

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    return content.strip()