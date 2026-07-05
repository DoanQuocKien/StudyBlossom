"""
StudyBlossom 🌸 — OCR Service
CPU-only stack:
  - pdfplumber  → extract digital PDF text (instant)
  - PaddleOCR   → general handwritten/printed text from images
  - easyocr     → fallback for difficult handwriting
"""

from __future__ import annotations
import re
from pathlib import Path


class OCRService:
    _paddle = None
    _easy   = None

    def _get_paddle(self):
        """Lazy-load PaddleOCR (slow first import, fast after)."""
        if self._paddle is None:
            try:
                from paddleocr import PaddleOCR
                self._paddle = PaddleOCR(
                    use_angle_cls=True,
                    lang="en",          # 'en' supports both English and Vietnamese
                    use_gpu=False,
                    show_log=False,
                )
            except ImportError:
                print("⚠️  PaddleOCR not installed. Run: pip install paddleocr")
        return self._paddle

    def _get_easy(self):
        """Lazy-load EasyOCR as fallback."""
        if self._easy is None:
            try:
                import easyocr
                self._easy = easyocr.Reader(["en", "vi"], gpu=False, verbose=False)
            except ImportError:
                print("⚠️  EasyOCR not installed. Run: pip install easyocr")
        return self._easy

    def extract_pdf(self, path: str) -> str:
        """
        Extract text from a PDF file.
        Tries pdfplumber first (for digital/embedded PDFs).
        If no text extracted, falls back to PaddleOCR on rendered pages.
        """
        text_parts = []

        try:
            import pdfplumber
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        text_parts.append(t.strip())

            if text_parts:
                return "\n\n".join(text_parts)

        except Exception as e:
            print(f"pdfplumber error: {e}")

        # Fallback: render pages as images and OCR
        try:
            import fitz  # pymupdf
            doc = fitz.open(path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                mat  = fitz.Matrix(2, 2)   # 2x zoom for better OCR
                pix  = page.get_pixmap(matrix=mat)
                img_path = f"{path}_page_{page_num}.png"
                pix.save(img_path)
                try:
                    text_parts.append(self.extract_image(img_path))
                finally:
                    Path(img_path).unlink(missing_ok=True)

        except Exception as e:
            print(f"PDF→image fallback error: {e}")

        return "\n\n".join(filter(None, text_parts)) or "[Could not extract text]"

    def extract_image(self, path: str) -> str:
        """
        Extract text from an image using PaddleOCR.
        Falls back to EasyOCR if PaddleOCR fails.
        """
        # Try PaddleOCR first
        try:
            paddle = self._get_paddle()
            if paddle:
                result = paddle.ocr(path, cls=True)
                if result and result[0]:
                    lines = [
                        line[1][0] for block in result
                        if block for line in block
                        if line and len(line) > 1 and line[1]
                    ]
                    text = "\n".join(lines)
                    if text.strip():
                        return self._post_process(text)

        except Exception as e:
            print(f"PaddleOCR error: {e}")

        # Fallback: EasyOCR
        try:
            easy = self._get_easy()
            if easy:
                result = easy.readtext(path)
                text = "\n".join([r[1] for r in result])
                if text.strip():
                    return self._post_process(text)

        except Exception as e:
            print(f"EasyOCR error: {e}")

        return "[OCR failed — check that PaddleOCR or EasyOCR is installed]"

    def _post_process(self, text: str) -> str:
        """Clean up common OCR artifacts."""
        # Remove excessive whitespace
        text = re.sub(r' {3,}', '  ', text)
        # Fix common Vietnamese character issues
        text = text.strip()
        return text


# Singleton
ocr_service = OCRService()
