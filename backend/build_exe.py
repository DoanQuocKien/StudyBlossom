import os
import shutil
import subprocess
import sys


def clean_pycache(root: str):
    """Remove all __pycache__ dirs inside root to avoid stale cross-Python .pyc files."""
    for dirpath, dirnames, _ in os.walk(root):
        for d in dirnames:
            if d == "__pycache__":
                full = os.path.join(dirpath, d)
                shutil.rmtree(full, ignore_errors=True)


def build():
    print("[Build] Building StudyBlossom executable using PyInstaller...")
    print(f"[Build] Python: {sys.executable} ({sys.version.split()[0]})")

    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Ensure PyInstaller is installed in THIS Python environment
    try:
        import PyInstaller
        print(f"[Build] PyInstaller {PyInstaller.__version__} found")
    except ImportError:
        print("[Build] Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    # Clean __pycache__ in the backend dir to avoid stale .pyc from other Python versions
    print("[Build] Cleaning __pycache__ directories...")
    clean_pycache(script_dir)

    # Use `sys.executable -s -m PyInstaller` so it always runs in the correct venv/conda.
    # The -s flag disables user site-packages (AppData\Roaming\Python\...) so PyInstaller
    # only sees conda/venv packages and doesn't mix bytecode from two different Python installs.
    cmd = [
        sys.executable, "-s", "-m", "PyInstaller",
        "--onefile",
        "--name=StudyBlossomService",
        "--collect-all=chromadb",
        "--collect-all=sentence_transformers",
        "--collect-all=langchain",
        "--collect-all=langchain_core",
        "--collect-all=langchain_community",
        "--collect-all=langchain_ollama",
        "--collect-all=pdfplumber",
        "--collect-all=rfc3987_syntax",
        "--collect-all=lark",
        "--collect-all=charset_normalizer",
        "main.py",
    ]

    print(f"[Build] Running: {' '.join(cmd)}")
    subprocess.check_call(cmd, cwd=script_dir)

    exe = os.path.join(script_dir, "dist", "StudyBlossomService.exe")
    if os.path.exists(exe):
        size_mb = os.path.getsize(exe) / (1024 * 1024)
        print(f"\n[Build] SUCCESS — {exe} ({size_mb:.1f} MB)")
    else:
        print("\n[Build] WARNING — exe not found in dist/")


if __name__ == "__main__":
    build()
