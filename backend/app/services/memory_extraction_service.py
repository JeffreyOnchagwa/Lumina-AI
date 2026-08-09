import json

from google import genai
from google.genai import types

from app.core.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
)

MEMORY_MODEL = "gemini-3.5-flash"


def extract_memory_from_message(
    message: str,
) -> dict | None:
    prompt = f"""
Analyze the user's message and determine whether it contains useful
long-term information that would improve future conversations.

Only store information that is likely to remain useful across future
conversations.

Good memory examples:
- communication preferences
- learning preferences
- stable interests
- long-term goals
- persistent project preferences
- preferred languages
- accessibility preferences

Do NOT store:
- greetings
- temporary requests
- one-time questions
- passwords
- authentication tokens
- financial credentials
- highly sensitive personal information
- information that is unlikely to matter later

User message:
{message}

If there is useful long-term information, return JSON exactly like:

{{
    "should_store": true,
    "category": "preference",
    "content": "User prefers concise explanations."
}}

If nothing should be stored, return:

{{
    "should_store": false,
    "category": null,
    "content": null
}}

Return JSON only.
"""

    response = client.models.generate_content(
        model=MEMORY_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    if not response.text:
        return None

    try:
        data = json.loads(response.text)
    except json.JSONDecodeError:
        return None

    if data.get("should_store") is not True:
        return None

    category = data.get("category")
    content = data.get("content")

    if not category or not content:
        return None

    return {
        "category": str(category)[:100],
        "content": str(content)[:2000],
    }