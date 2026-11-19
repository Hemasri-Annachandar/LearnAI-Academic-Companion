
import json
import os
import re
from collections import Counter


UPLOAD_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
)

METADATA_FILE = os.path.join(UPLOAD_DIR, "metadata.json")

STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were",
    "what", "why", "when", "where", "who", "how",
    "explain", "describe", "define", "tell", "me",
    "about", "of", "to", "in", "on", "for", "and",
    "or", "with", "from", "by", "it", "this", "that",
    "can", "could", "would", "should", "do", "does",
    "did", "please", "give", "show"
}


def tokenize(text: str) -> list[str]:
    """Convert text into lowercase words."""
    return re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())


def retrieve_relevant_chunks(
    question: str,
    file_ids: list[str] | None = None,
    top_k: int = 5
) -> tuple[str, list[dict]]:
    """
    Retrieve relevant textbook chunks using keyword matching.

    If file_ids are provided, search only those textbooks.
    Otherwise, search all uploaded textbooks.
    """

    if not os.path.exists(METADATA_FILE):
        return "", []

    try:
        with open(METADATA_FILE, "r", encoding="utf-8") as file:
            metadata = json.load(file)
    except (json.JSONDecodeError, OSError):
        return "", []

    if not isinstance(metadata, dict):
        return "", []

    question_words = [
        word for word in tokenize(question)
        if word not in STOP_WORDS and len(word) > 1
    ]

    if not question_words:
        return "", []

    question_terms = set(question_words)
    ranked_chunks = []

    for file_id, document in metadata.items():

        if file_ids is not None and file_id not in file_ids:
            continue

        if not isinstance(document, dict):
            continue

        filename = document.get("filename", "Unknown textbook")
        chunks = document.get("chunks", [])

        if not isinstance(chunks, list):
            continue

        for chunk in chunks:

            if not isinstance(chunk, dict):
                continue

            chunk_text = chunk.get("text", "")

            if not isinstance(chunk_text, str) or not chunk_text.strip():
                continue

            chunk_words = tokenize(chunk_text)
            word_counts = Counter(chunk_words)

            # Count occurrences of each question keyword.
            score = sum(
                word_counts.get(term, 0)
                for term in question_terms
            )

            if score == 0:
                continue

            # Give a small bonus when the complete question phrase appears.
            if question.strip().lower() in chunk_text.lower():
                score += 5

            ranked_chunks.append({
                "score": score,
                "file_id": file_id,
                "filename": filename,
                "page": chunk.get("page"),
                "chunk_id": chunk.get("chunk_id"),
                "text": chunk_text
            })

    ranked_chunks.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    selected_chunks = ranked_chunks[:top_k]

    context_parts = []
    sources = []

    for item in selected_chunks:

        context_parts.append(
            f"Textbook: {item['filename']}\n"
            f"Page: {item['page']}\n"
            f"Content: {item['text']}"
        )

        sources.append({
            "file_id": item["file_id"],
            "filename": item["filename"],
            "page": item["page"],
            "chunk_id": item["chunk_id"],
            "score": item["score"]
        })

    context = "\n\n---\n\n".join(context_parts)

    return context, sources
