
import pymupdf


def extract_text_from_pdf(file_path: str):
    """Extract text from every page of a PDF."""

    extracted_pages = []

    pdf_document = pymupdf.open(file_path)

    try:
        for page_number, page in enumerate(pdf_document, start=1):
            text = page.get_text("text")

            extracted_pages.append({
                "page": page_number,
                "text": text.strip()
            })
    finally:
        pdf_document.close()

    return extracted_pages
