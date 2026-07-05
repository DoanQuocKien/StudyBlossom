"""
StudyBlossom 🌸 — Math OCR Service
Uses pix2tex (LaTeX-OCR) for single math equation images.
CPU-only, works on images of isolated formulas.
"""

from __future__ import annotations


class MathOCRService:
    _model = None

    def _get_model(self):
        if self._model is None:
            try:
                from pix2tex.cli import LatexOCR
                self._model = LatexOCR()
                print("✅ pix2tex (Math OCR) loaded")
            except ImportError:
                print("⚠️  pix2tex not installed. Run: pip install pix2tex")
            except Exception as e:
                print(f"⚠️  pix2tex load error: {e}")
        return self._model

    def extract(self, image_path: str) -> str:
        """
        Extract a LaTeX expression from an image of a math equation.
        Returns the LaTeX string (without $$ delimiters).
        """
        model = self._get_model()
        if not model:
            return r"\text{[Math OCR unavailable — install pix2tex]}"

        try:
            from PIL import Image
            img = Image.open(image_path)
            latex = model(img)
            return str(latex).strip()
        except Exception as e:
            print(f"Math OCR error: {e}")
            return r"\text{[Math OCR failed]}"


# Singleton
math_ocr_service = MathOCRService()
