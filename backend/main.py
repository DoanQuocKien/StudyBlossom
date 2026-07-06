# ============================================================
# StudyBlossom 🌸 — FastAPI Service
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import sys

# Force UTF-8 encoding on Windows console to prevent Unicode crashes from emojis
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from routers import ocr, rag, quiz


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    print("🌸 StudyBlossom service starting...")
    # Pre-load OCR models in background
    try:
        from services.ocr_service import ocr_service
        print("✅ OCR service ready")
    except Exception as e:
        print(f"⚠️  OCR service init warning: {e}")

    try:
        from services.rag_service import rag_service
        print("✅ RAG service ready")
    except Exception as e:
        print(f"⚠️  RAG service init warning: {e}")

    print("🌸 Service ready at http://localhost:8000")
    yield
    print("👋 StudyBlossom service shutting down...")


app = FastAPI(
    title="StudyBlossom API 🌸",
    description="Service Provider for StudyBlossom — Text Scanner + AI Study Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow frontend to call the API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow all origins for local use
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ocr.router,  prefix="/api/ocr",  tags=["OCR"])
app.include_router(rag.router,  prefix="/api/rag",  tags=["RAG"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])


@app.get("/api/health")
async def health():
    """Health check — lightweight, does NOT block on Ollama connection."""
    from services.rag_service import rag_service
    # Report whichever model was already loaded; don't trigger a new Ollama connection
    model = rag_service.model_name if rag_service._llm else "not loaded"
    return {
        "status": "ok",
        "model":  model,
        "app":    "StudyBlossom",
    }


if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support()

    import sys
    is_frozen = getattr(sys, 'frozen', False)
    if is_frozen:
        # When running as a packaged executable, pass the app object directly and disable reload
        uvicorn.run(app, host="0.0.0.0", port=8000)
    else:
        # Local development mode with reload enabled
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
