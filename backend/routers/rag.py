# ============================================================
# StudyBlossom 🌸 — RAG Router
# ============================================================

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import tempfile, os

from services.rag_service import rag_service
from services.ocr_service import ocr_service

router = APIRouter()


class QueryRequest(BaseModel):
    query:    str
    language: str = "vi"
    top_k:    int = 4


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document for RAG indexing.
    Pipeline:
      1. If PDF (digital): extract text with pdfplumber
      2. If image/scanned PDF: OCR with PaddleOCR
      3. Chunk the text
      4. Embed with sentence-transformers
      5. Store in ChromaDB
    Returns the number of chunks indexed.
    """
    if not file:
        raise HTTPException(400, "No file provided")

    suffix = os.path.splitext(file.filename or "")[-1].lower()
    allowed = {".pdf", ".jpg", ".jpeg", ".png", ".txt", ".md"}
    if suffix not in allowed:
        raise HTTPException(400, f"Unsupported type: {suffix}")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        # Step 1: Extract text
        if suffix == ".pdf":
            text = ocr_service.extract_pdf(tmp_path)
        elif suffix in {".jpg", ".jpeg", ".png"}:
            text = ocr_service.extract_image(tmp_path)
        else:
            with open(tmp_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()

        if not text.strip():
            raise HTTPException(422, "Could not extract any text from the file")

        # Step 2: Index in ChromaDB
        chunks = rag_service.add_document(
            text       = text,
            doc_name   = file.filename or "document",
            doc_type   = suffix.lstrip("."),
        )

        return JSONResponse({
            "status":   "indexed",
            "filename": file.filename,
            "chars":    len(text),
            "chunks":   chunks,
        })

    except HTTPException: raise
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {str(e)}")
    finally:
        try: os.unlink(tmp_path)
        except: pass


@router.post("/query")
async def query_rag(req: QueryRequest):
    """
    Query the RAG pipeline.
    Retrieves relevant document chunks from ChromaDB,
    then passes them + the user query to Ollama for a grounded answer.
    """
    if not req.query.strip():
        raise HTTPException(400, "Empty query")

    try:
        answer = rag_service.query(
            question = req.query,
            top_k    = req.top_k,
            language = req.language,
        )
        return JSONResponse({"answer": answer, "query": req.query})

    except Exception as e:
        raise HTTPException(500, f"Query failed: {str(e)}")


@router.delete("/documents")
async def clear_documents():
    """Clear all indexed documents from ChromaDB."""
    try:
        rag_service.clear_all()
        return JSONResponse({"status": "cleared"})
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/documents")
async def list_documents():
    """List indexed document names."""
    try:
        docs = rag_service.list_documents()
        return JSONResponse({"documents": docs})
    except Exception as e:
        raise HTTPException(500, str(e))
