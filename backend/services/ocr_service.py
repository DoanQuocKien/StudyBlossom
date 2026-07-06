"""
StudyBlossom 🌸 — OCR Service
CPU-only stack:
  - pymupdf (fitz) → extract digital PDF text (instant, no mypyc issues)
  - easyocr         → general handwritten/printed text from images
  - PaddleOCR 3.x   → fallback only, using correct 3.x pipeline API
"""

from __future__ import annotations
import re
import warnings
from pathlib import Path

# Suppress the noisy torch pin_memory warning (no GPU, expected behaviour)
warnings.filterwarnings(
    "ignore",
    message=".*pin_memory.*no accelerator.*",
    category=UserWarning,
)


class OCRService:
    _easy   = None
    _paddle = None

    # ------------------------------------------------------------------
    # Lazy loaders
    # ------------------------------------------------------------------

    def _get_easy(self):
        """Lazy-load EasyOCR (primary OCR engine)."""
        if self._easy is None:
            try:
                import easyocr
                self._easy = easyocr.Reader(["en", "vi"], gpu=False, verbose=False)
            except ImportError:
                print("⚠️  EasyOCR not installed. Run: pip install easyocr")
        return self._easy

    def _get_paddle(self):
        """
        Lazy-load PaddleOCR 3.x (fallback engine).
        PaddleOCR 3.x uses a pipeline-based API — no use_gpu/show_log kwargs.
        """
        if self._paddle is None:
            try:
                from paddleocr import PaddleOCR
                # 3.x: only lang is a safe universal kwarg
                self._paddle = PaddleOCR(lang="en")
            except Exception as e:
                print(f"⚠️  PaddleOCR init failed (will use EasyOCR only): {e}")
        return self._paddle

    # ------------------------------------------------------------------
    # PDF extraction (pymupdf — no mypyc, bundles cleanly in PyInstaller)
    # ------------------------------------------------------------------

    def extract_pdf(self, path: str) -> str:
        """
        Extract text from a PDF file.
        Uses pymupdf (fitz) for both digital text and image-based pages.
        Falls back to OCR on pages that yield no text.
        """
        text_parts = []

        try:
            import fitz  # pymupdf
            doc = fitz.open(path)

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)

                # Try embedded text first (fast, perfect quality)
                t = page.get_text("text").strip()
                if t:
                    text_parts.append(t)
                    continue

                # Page has no embedded text → render and OCR
                mat     = fitz.Matrix(2, 2)  # 2× zoom for better OCR accuracy
                pix     = page.get_pixmap(matrix=mat)
                img_path = f"{path}_page_{page_num}.png"
                pix.save(img_path)
                try:
                    ocr_text = self.extract_image(img_path)
                    if ocr_text and ocr_text != "[OCR failed — check that EasyOCR is installed]":
                        text_parts.append(ocr_text)
                finally:
                    Path(img_path).unlink(missing_ok=True)

        except Exception as e:
            print(f"PDF extraction error: {e}")

        return "\n\n".join(filter(None, text_parts)) or "[Could not extract text]"

    # ------------------------------------------------------------------
    # Image OCR
    # ------------------------------------------------------------------

    def extract_image(self, path: str) -> str:
        """
        Extract text from an image.
        Primary: EasyOCR (bundles well, CPU-friendly).
        Fallback: PaddleOCR 3.x.
        """
        # --- EasyOCR (primary) ---
        try:
            easy = self._get_easy()
            if easy:
                result = easy.readtext(path)
                text = "\n".join([r[1] for r in result])
                if text.strip():
                    return self._post_process(text)
        except Exception as e:
            print(f"EasyOCR error: {e}")

        # --- PaddleOCR 3.x (fallback) ---
        try:
            paddle = self._get_paddle()
            if paddle:
                result = paddle.ocr(path)
                if result and result[0]:
                    lines = [
                        item["text"]
                        for block in result
                        if block
                        for item in (block if isinstance(block, list) else [])
                        if isinstance(item, dict) and "text" in item
                    ]
                    if not lines:
                        # Older 3.x returns [[box, (text, score)], ...]
                        lines = [
                            line[1][0]
                            for block in result
                            if block
                            for line in block
                            if line and len(line) > 1 and line[1]
                        ]
                    text = "\n".join(lines)
                    if text.strip():
                        return self._post_process(text)
        except Exception as e:
            print(f"PaddleOCR error: {e}")

        return "[OCR failed — check that EasyOCR is installed]"

    # ------------------------------------------------------------------
    # Post-processing
    # ------------------------------------------------------------------

    def _post_process(self, text: str) -> str:
        """Clean up common OCR artifacts."""
        text = re.sub(r' {3,}', '  ', text)
        text = text.strip()
        return text


# Singleton
ocr_service = OCRService()
