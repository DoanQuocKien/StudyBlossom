import os
import subprocess
import sys

def build():
    print("[Build] Building StudyBlossom executable using PyInstaller...")
    try:
        import PyInstaller
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    # Build FastAPI backend to a single executable
    # Collecting data files for ChromaDB and LangChain
    cmd = [
        "pyinstaller",
        "--onefile",
        "--name=StudyBlossomService",
        "--collect-all=chromadb",
        "--collect-all=sentence_transformers",
        "--collect-all=langchain",
        "--collect-all=pdfplumber",
        "main.py"
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    subprocess.check_call(cmd, cwd=script_dir)
    print("\n[Build] Build finished! Executable saved in backend/dist/StudyBlossomService.exe")

if __name__ == "__main__":
    build()
