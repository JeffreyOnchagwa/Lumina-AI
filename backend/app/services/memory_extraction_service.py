import json

from groq import Groq

from app.core.config import settings


def extract_memory_from_message(
    message: str,
) -> dict | None:
    if not settings.GROQ_API_KEY:
        return None

    client = Groq(
        api_key=settings.GROQ_API_KEY,
        timeout=15.0,
        max_retries=0,
    )

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

Return JSON only.

If memory should be stored:

{{
  "should_store": true,
  "category": "preference",
  "content": "User prefers concise explanations."
}}

If nothing should be stored:

{{
  "should_store": false,
  "category": null,
  "content": null
}}
"""

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            reasoning_effort="low",
            include_reasoning=False,
            response_format={
                "type": "json_object"
            },
            max_completion_tokens=300,
            stream=False,
        )

    except Exception:
        # Memory extraction should never crash normal chat.
        return None

    if not response.choices:
        return None

    content = response.choices[0].message.content

    if not content:
        return None

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        return None

    if data.get("should_store") is not True:
        return None

    category = data.get("category")
    memory_content = data.get("content")

    if not category or not memory_content:
        return None

    return {
        "category": str(category)[:100],
        "content": str(memory_content)[:2000],
    }