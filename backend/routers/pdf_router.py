import os
import json
import uuid
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException

from services.pdf_service import extract_text_from_pdf
from services.chunking_service import split_text_into_chunks

router = APIRouter(
    prefix="/api/pdfs",
    tags=["PDF Upload & Management"]
)

UPLOAD_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
)

os.makedirs(UPLOAD_DIR, exist_ok=True)
METADATA_FILE = os.path.join(UPLOAD_DIR, "metadata.json")


def load_metadata():
    if os.path.exists(METADATA_FILE):
        try:
            with open(METADATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_metadata(data):
    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


@router.get("/")
def list_pdfs():
    """List all uploaded textbooks with their extraction metadata."""
    metadata = load_metadata()
    documents = []

    for file_id, info in metadata.items():
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
        if os.path.exists(file_path):
            documents.append({
                "file_id": file_id,
                "filename": info.get("filename", "Unknown.pdf"),
                "file_size": info.get("file_size", os.path.getsize(file_path)),
                "total_pages": info.get("total_pages", 0),
                "total_chunks": info.get("total_chunks", 0),
                "created_at": info.get("created_at")
            })

    return {
        "success": True,
        "count": len(documents),
        "documents": documents
    }


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a PDF, extract pages, chunk text, and persist metadata."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}.pdf"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty"
            )

        if not content.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="Invalid PDF file"
            )

        with open(file_path, "wb") as pdf_file:
            pdf_file.write(content)

        file_size = len(content)

        # Step 1: Extract text from PDF
        extracted_pages = extract_text_from_pdf(file_path)

        # Step 2: Convert extracted text into chunks
        chunks = split_text_into_chunks(
            extracted_pages,
            chunk_size=500,
            chunk_overlap=100
        )

        # Step 3: Save metadata
        metadata = load_metadata()
        metadata[file_id] = {
            "filename": file.filename,
            "file_size": file_size,
            "total_pages": len(extracted_pages),
            "total_chunks": len(chunks),
            "created_at": datetime.now().isoformat(),
            "chunks": chunks
        }
        save_metadata(metadata)

        return {
            "success": True,
            "message": "PDF uploaded, extracted and chunked successfully",
            "file_id": file_id,
            "filename": file.filename,
            "file_size": file_size,
            "total_pages": len(extracted_pages),
            "total_chunks": len(chunks),
            "chunks": chunks
        }

    except HTTPException:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

    except Exception as error:
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"PDF processing failed: {str(error)}"
        )

    finally:
        await file.close()


@router.delete("/{file_id}")
def delete_pdf(file_id: str):
    """Delete an uploaded PDF and its extracted chunks."""
    safe_filename = f"{file_id}.pdf"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    if os.path.exists(file_path):
        os.remove(file_path)

    metadata = load_metadata()
    if file_id in metadata:
        del metadata[file_id]
        save_metadata(metadata)

    return {
        "success": True,
        "message": f"Document {file_id} deleted successfully"
    }


@router.get("/{file_id}/chunks")
def get_pdf_chunks(file_id: str):
    """Retrieve extracted chunks for a specific textbook."""
    metadata = load_metadata()
    if file_id not in metadata:
        raise HTTPException(
            status_code=404,
            detail="Textbook not found"
        )

    doc_info = metadata[file_id]
    return {
        "success": True,
        "file_id": file_id,
        "filename": doc_info.get("filename"),
        "total_chunks": doc_info.get("total_chunks", 0),
        "chunks": doc_info.get("chunks", [])
    }
