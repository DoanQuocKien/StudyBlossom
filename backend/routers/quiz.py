# ============================================================
# StudyBlossom 🌸 — Quiz Router (AI Generate + AI Grade)
# ============================================================

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import json, re, tempfile, os

from services.rag_service import rag_service
from services.ocr_service import ocr_service

router = APIRouter()


# ── Models ────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    topic: str
    num_questions: int = 10
    types: str = "mixed"        # "mcq" | "sa" | "mixed"
    language: str = "vi"
    document_text: Optional[str] = None   # Pre-extracted text from notes

class GradeAnswer(BaseModel):
    question: str
    answer: str
    expected: Optional[str] = None       # For MCQ: the correct answer text

class GradeRequest(BaseModel):
    answers: List[GradeAnswer]
    language: str = "vi"
    context: Optional[str] = None        # The test paper text for context


# ── Quiz Generation ────────────────────────────────────────────

@router.post("/generate")
async def generate_quiz(req: GenerateRequest):
    """
    Generate quiz questions using Ollama.
    Returns a list of structured question objects.
    """
    lang_instr = (
        "Trả lời bằng tiếng Việt. " if req.language == "vi"
        else "Answer in English. "
    )

    type_instr = {
        "mcq":   "Only generate multiple-choice questions (4 options each, one correct).",
        "sa":    "Only generate short-answer/essay questions (no options, just a model answer).",
        "mixed": "Mix of multiple-choice (MCQ) and short-answer (SA) questions.",
    }.get(req.types, "Mix MCQ and short-answer questions.")

    context_block = ""
    if req.document_text:
        snippet = req.document_text[:4000]
        context_block = f"\n\nSource material to base questions on:\n---\n{snippet}\n---\n"

    prompt = f"""{lang_instr}You are a university exam question generator.
{type_instr}
Generate exactly {req.num_questions} exam questions about: "{req.topic}".{context_block}

IMPORTANT: Respond ONLY with a valid JSON array. No explanation, no markdown fences.
Each item must have this exact structure:
- For MCQ: {{"type":"mcq","text":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0,"explanation":"..."}}
  (correct = 0-indexed integer of the correct option)
- For SA:  {{"type":"sa","text":"...","model_answer":"...","points":5}}

Output the JSON array only:"""

    try:
        raw = rag_service._call_ollama(prompt)
        # Strip any markdown fences that the model might add
        clean = re.sub(r"```(?:json)?|```", "", raw).strip()
        # Find the first [ ... ] block
        match = re.search(r"\[.*\]", clean, re.DOTALL)
        if not match:
            raise ValueError("No JSON array found in model response")
        questions = json.loads(match.group())
        # Validate and sanitise
        validated = []
        for q in questions:
            if not isinstance(q, dict) or "text" not in q:
                continue
            q.setdefault("type", "mcq")
            if q["type"] == "mcq":
                q.setdefault("options", [])
                q.setdefault("correct", 0)
                q.setdefault("explanation", "")
            else:
                q.setdefault("model_answer", "")
                q.setdefault("points", 5)
            validated.append(q)
        return JSONResponse({"questions": validated})
    except Exception as e:
        raise HTTPException(500, f"Generation failed: {str(e)}")


# ── Quiz Grading ───────────────────────────────────────────────

@router.post("/grade")
async def grade_quiz(req: GradeRequest):
    """
    Grade open-ended answers using Ollama.
    Returns a score and feedback for each answer.
    """
    lang_instr = "Respond in Vietnamese." if req.language == "vi" else "Respond in English."
    context_block = f"\nTest context:\n{req.context[:2000]}\n" if req.context else ""

    results = []
    for item in req.answers:
        prompt = f"""{lang_instr} You are a fair and constructive exam grader.{context_block}

Question: {item.question}
{"Expected answer: " + item.expected if item.expected else ""}
Student's answer: {item.answer if item.answer.strip() else "(No answer given)"}

Grade this answer. Respond ONLY with valid JSON (no markdown):
{{"score": <0-10>, "feedback": "<short constructive feedback in 1-2 sentences>", "correct": <true/false>}}"""

        try:
            raw = rag_service._call_ollama(prompt)
            clean = re.sub(r"```(?:json)?|```", "", raw).strip()
            match = re.search(r"\{.*\}", clean, re.DOTALL)
            if match:
                data = json.loads(match.group())
            else:
                data = {"score": 0, "feedback": raw[:200], "correct": False}
        except Exception as e:
            data = {"score": 0, "feedback": f"Grading error: {str(e)}", "correct": False}
        results.append(data)

    return JSONResponse({"results": results})


# ── OCR helper for test paper upload ──────────────────────────

@router.post("/ocr-paper")
async def ocr_paper(file: UploadFile = File(...)):
    """
    Run OCR on an uploaded test paper image or PDF.
    Returns extracted text for use in quiz generation.
    """
    suffix = os.path.splitext(file.filename or "")[-1].lower()
    allowed = {".pdf", ".jpg", ".jpeg", ".png"}
    if suffix not in allowed:
        raise HTTPException(400, f"Unsupported file type: {suffix}")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        if suffix == ".pdf":
            text = ocr_service.extract_pdf(tmp_path)
        else:
            text = ocr_service.extract_image(tmp_path)
        return JSONResponse({"text": text, "chars": len(text)})
    except Exception as e:
        raise HTTPException(500, f"OCR failed: {str(e)}")
    finally:
        try: os.unlink(tmp_path)
        except: pass
