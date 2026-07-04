# ============================================================
# StudyBloom 🌸 — OCR Router
# ============================================================

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import tempfile, os

from services.ocr_service import ocr_service
from services.math_ocr    import math_ocr_service

router = APIRouter()


@router.post("/image")
async def ocr_image(file: UploadFile = File(...)):
    """
    OCR an uploaded image or PDF.
    Returns extracted text as Markdown.
    Automatically routes:
      - PDFs        → pdfplumber (instant, no OCR needed for digital PDFs)
      - Images      → PaddleOCR (general text) + pix2tex if math equations detected
    """
    if not file:
        raise HTTPException(400, "No file uploaded")

    suffix = os.path.splitext(file.filename or "")[-1].lower()
    allowed = {".pdf", ".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}
    if suffix not in allowed:
        raise HTTPException(400, f"Unsupported file type: {suffix}")

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        if suffix == ".pdf":
            text = ocr_service.extract_pdf(tmp_path)
        else:
            text = ocr_service.extract_image(tmp_path)

        return JSONResponse({
            "text":     text,
            "filename": file.filename,
            "chars":    len(text),
        })

    except Exception as e:
        raise HTTPException(500, f"OCR failed: {str(e)}")
    finally:
        try: os.unlink(tmp_path)
        except: pass


@router.post("/math")
async def ocr_math_equation(file: UploadFile = File(...)):
    """
    Extract a single math equation from an image → LaTeX.
    Best for cropped images of single formulas.
    Uses pix2tex (LaTeX-OCR).
    """
    suffix = os.path.splitext(file.filename or "")[-1].lower()
    if suffix not in {".jpg", ".jpeg", ".png"}:
        raise HTTPException(400, "Only JPG/PNG supported for math OCR")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        latex = math_ocr_service.extract(tmp_path)
        return JSONResponse({"latex": latex, "rendered": f"$${latex}$$"})
    except Exception as e:
        raise HTTPException(500, f"Math OCR failed: {str(e)}")
    finally:
        try: os.unlink(tmp_path)
        except: pass
