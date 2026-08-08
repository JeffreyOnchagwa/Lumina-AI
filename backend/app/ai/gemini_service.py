from google import genai

from app.core.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def generate_response(
    prompt: str,
    conversation_history: list[dict[str, str]] | None = None,
) -> str:
    contents = []

    if conversation_history:
        for message in conversation_history:
            contents.append(
                {
                    "role": message["role"],
                    "parts": [
                        {
                            "text": message["content"],
                        }
                    ],
                }
            )

    contents.append(
        {
            "role": "user",
            "parts": [
                {
                    "text": prompt,
                }
            ],
        }
    )

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=contents,
    )

    return response.text