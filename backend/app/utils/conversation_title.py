import re


def generate_conversation_title(message: str) -> str:
    title = re.sub(r"\s+", " ", message).strip()

    if not title:
        return "New conversation"

    if len(title) > 60:
        title = title[:57].rstrip() + "..."

    return title