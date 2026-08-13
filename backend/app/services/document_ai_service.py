from app.ai.groq_service import generate_response


MAX_DOCUMENT_CHARS = 12000


def prepare_document_text(
    document_text: str,
) -> str:
    text = document_text.strip()

    if len(text) <= MAX_DOCUMENT_CHARS:
        return text

    return text[:MAX_DOCUMENT_CHARS]


def summarize_document(
    document_text: str,
) -> str:
    prepared_text = prepare_document_text(
        document_text
    )

    prompt = (
        "Summarize this document clearly and concisely. "
        "Include the main ideas and important facts. "
        "Do not invent information.\n\n"
        "DOCUMENT:\n"
        f"{prepared_text}"
    )

    return generate_response(
        message=prompt
    )


def simplify_document(
    document_text: str,
) -> str:
    prepared_text = prepare_document_text(
        document_text
    )

    prompt = (
        "Rewrite this document in simple, clear language. "
        "Keep the important information and explain difficult ideas "
        "simply. Do not invent information.\n\n"
        "DOCUMENT:\n"
        f"{prepared_text}"
    )

    return generate_response(
        message=prompt
    )


def answer_document_question(
    document_text: str,
    question: str,
) -> str:
    prepared_text = prepare_document_text(
        document_text
    )

    prompt = (
        "Answer the question using only the document below. "
        "If the document does not contain the answer, say so. "
        "Be concise and do not invent information.\n\n"
        "DOCUMENT:\n"
        f"{prepared_text}\n\n"
        "QUESTION:\n"
        f"{question}"
    )

    return generate_response(
        message=prompt
    )