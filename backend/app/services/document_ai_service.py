from app.ai.gemini_service import generate_response


def summarize_document(document_text: str) -> str:
    prompt = (
        "Summarize the following document clearly and accurately. "
        "Preserve the most important ideas, facts, and conclusions. "
        "Do not invent information.\n\n"
        f"{document_text}"
    )

    return generate_response(prompt)


def simplify_document(document_text: str) -> str:
    prompt = (
        "Rewrite the following document in simpler language while preserving "
        "its meaning. Use short, clear sentences and explain difficult terms "
        "when necessary. Do not remove important information.\n\n"
        f"{document_text}"
    )

    return generate_response(prompt)


def answer_document_question(
    document_text: str,
    question: str,
) -> str:
    prompt = (
        "Answer the user's question using only the document provided below. "
        "If the answer is not supported by the document, say that the document "
        "does not contain enough information. Do not invent facts.\n\n"
        f"DOCUMENT:\n{document_text}\n\n"
        f"QUESTION:\n{question}"
    )

    return generate_response(prompt)