"""
StudyBloom 🌸 — RAG Service
Pipeline:
  text → chunk → embed (sentence-transformers) → store (ChromaDB) → retrieve → answer (Ollama)
"""

from __future__ import annotations
import uuid
from pathlib import Path
from typing import List


DATA_DIR = Path(__file__).parent.parent.parent / "data"
CHROMA_DIR = DATA_DIR / "chromadb"
CHROMA_DIR.mkdir(parents=True, exist_ok=True)


class RAGService:
    _collection = None
    _embedder   = None
    _llm        = None
    model_name  = "gemma3:4b"

    def _get_embedder(self):
        if self._embedder is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._embedder = SentenceTransformer(
                    "sentence-transformers/all-MiniLM-L6-v2",
                    device="cpu",
                )
                print("✅ Embedder loaded (all-MiniLM-L6-v2)")
            except ImportError:
                print("⚠️  sentence-transformers not installed")
        return self._embedder

    def _get_collection(self):
        if self._collection is None:
            try:
                import chromadb
                client = chromadb.PersistentClient(path=str(CHROMA_DIR))
                self._collection = client.get_or_create_collection(
                    name="studybloom_docs",
                    metadata={"hnsw:space": "cosine"},
                )
                print(f"✅ ChromaDB ready ({self._collection.count()} chunks)")
            except ImportError:
                print("⚠️  chromadb not installed")
        return self._collection

    def _get_llm(self):
        """Get Ollama LLM via langchain-ollama."""
        if self._llm is None:
            try:
                from langchain_ollama import OllamaLLM

                # Try preferred model first, then fallback
                for model in ["gemma3:4b", "llama3.2:3b", "mistral", "phi3"]:
                    try:
                        llm = OllamaLLM(model=model, temperature=0.3)
                        llm.invoke("hi")  # Test call
                        self._llm = llm
                        self.model_name = model
                        print(f"✅ Ollama model '{model}' ready")
                        break
                    except Exception:
                        continue

                if not self._llm:
                    print("⚠️  No Ollama model available. Start Ollama and pull a model.")

            except ImportError:
                print("⚠️  langchain-ollama not installed")
        return self._llm

    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks."""
        words  = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i : i + chunk_size])
            chunks.append(chunk)
            i += chunk_size - overlap
        return [c for c in chunks if len(c.strip()) > 20]

    def add_document(self, text: str, doc_name: str, doc_type: str = "text") -> int:
        """Chunk, embed, and store a document. Returns number of chunks."""
        embedder   = self._get_embedder()
        collection = self._get_collection()

        if not embedder or not collection:
            raise RuntimeError("Embedder or ChromaDB not available")

        chunks = self._chunk_text(text)
        if not chunks:
            return 0

        embeddings = embedder.encode(chunks, show_progress_bar=False).tolist()

        ids        = [str(uuid.uuid4()) for _ in chunks]
        metadatas  = [{"doc_name": doc_name, "doc_type": doc_type, "chunk_idx": i} for i, _ in enumerate(chunks)]

        collection.add(documents=chunks, embeddings=embeddings, ids=ids, metadatas=metadatas)
        return len(chunks)

    def query(self, question: str, top_k: int = 4, language: str = "vi") -> str:
        """Retrieve relevant chunks and answer with Ollama."""
        embedder   = self._get_embedder()
        collection = self._get_collection()
        llm        = self._get_llm()

        if not embedder:
            return "❌ Embedding service not available. Check installation."
        if not llm:
            return ("❌ Ollama is not running or no model is loaded.\n\n"
                    "Please:\n1. Install Ollama from https://ollama.com\n"
                    "2. Run: `ollama pull gemma3:4b`\n"
                    "3. Start Ollama and try again.")

        # Embed the question
        q_embedding = embedder.encode([question]).tolist()[0]

        # Retrieve from ChromaDB
        count = collection.count()
        if count == 0:
            context = "(No documents indexed yet)"
        else:
            k = min(top_k, count)
            results = collection.query(query_embeddings=[q_embedding], n_results=k)
            docs    = results.get("documents", [[]])[0]
            context = "\n\n---\n\n".join(docs) if docs else "(No relevant documents found)"

        # Build prompt
        if language == "vi":
            prompt = f"""Bạn là trợ lý học tập thông minh cho sinh viên Việt Nam.
Dựa vào tài liệu dưới đây, hãy trả lời câu hỏi một cách chính xác và dễ hiểu.
Nếu tài liệu không đủ thông tin, hãy trả lời dựa trên kiến thức chung của bạn và nói rõ điều đó.
Trả lời bằng tiếng Việt. Sử dụng định dạng rõ ràng với bullet points khi cần thiết.

TÀI LIỆU:
{context}

CÂU HỎI: {question}

TRẢ LỜI:"""
        else:
            prompt = f"""You are a smart study assistant for university students.
Based on the documents below, answer the question accurately and clearly.
If the documents don't have enough information, answer from your general knowledge and mention it.
Format your answer clearly with bullet points where helpful.

DOCUMENTS:
{context}

QUESTION: {question}

ANSWER:"""

        response = llm.invoke(prompt)
        return str(response).strip()

    def _call_ollama(self, prompt: str) -> str:
        """Direct LLM call without RAG — for generation and grading tasks."""
        llm = self._get_llm()
        if not llm:
            raise RuntimeError(
                "Ollama is not running or no model is loaded. "
                "Please install Ollama and run: ollama pull gemma3:4b"
            )
        return str(llm.invoke(prompt)).strip()

    def clear_all(self):
        """Remove all documents from ChromaDB."""
        collection = self._get_collection()
        if collection:
            ids = collection.get()["ids"]
            if ids:
                collection.delete(ids=ids)

    def list_documents(self) -> List[str]:
        """List unique document names in the collection."""
        collection = self._get_collection()
        if not collection or collection.count() == 0:
            return []
        results  = collection.get(include=["metadatas"])
        names    = list({m.get("doc_name","unknown") for m in results.get("metadatas",[])})
        return sorted(names)


# Singleton
rag_service = RAGService()
