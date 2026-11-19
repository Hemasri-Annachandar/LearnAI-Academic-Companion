
def split_text_into_chunks(
    extracted_pages,
    chunk_size=500,
    chunk_overlap=100
):
    """Split extracted PDF text into overlapping chunks."""

    chunks = []
    chunk_id = 1

    if chunk_size <= 0:
        raise ValueError("Chunk size must be positive")

    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError(
            "Overlap must be non-negative and smaller than chunk size"
        )

    step = chunk_size - chunk_overlap

    for page_data in extracted_pages:
        text = page_data["text"]
        page_number = page_data["page"]

        if not text.strip():
            continue

        start = 0

        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append({
                    "chunk_id": chunk_id,
                    "page": page_number,
                    "text": chunk_text
                })

                chunk_id += 1

            start += step

    return chunks
