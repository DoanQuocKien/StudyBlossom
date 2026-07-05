@echo off
title StudyBlossom - Startup
color 0D
echo.
echo  ==========================================
echo   StudyBlossom - Starting...
echo  ==========================================
echo.

rem ============================================================
rem  PRIORITY 1: Pre-compiled EXE (fastest, no Python needed)
rem ============================================================
if exist "%~dp0backend\dist\StudyBlossomService.exe" (
    echo [EXE] Pre-compiled backend found. Starting...
    start "StudyBlossom Service" "%~dp0backend\dist\StudyBlossomService.exe"
    goto setup_ollama
)

rem ============================================================
rem  PRIORITY 2: Global Python
rem ============================================================
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [Python] Global Python detected.
    goto run_with_global_python
)

rem ============================================================
rem  PRIORITY 3: Portable Python (already set up)
rem ============================================================
if exist "%~dp0.python\python.exe" if exist "%~dp0.python\.deps_installed" (
    echo [Python] Portable Python detected.
    goto run_with_portable_python
)

rem ============================================================
rem  PRIORITY 4: Download portable Python (first run)
rem ============================================================
echo [Setup] No Python or pre-built EXE found.
echo [Setup] StudyBlossom will download a portable Python environment.
echo [Setup] This is a one-time setup and does NOT modify your system.
echo.
choice /M "Continue with automatic setup?"
if %errorlevel% neq 1 (
    echo Setup cancelled.
    pause
    exit /b 1
)

echo.
echo [1/5] Creating directories...
mkdir "%~dp0.python" >nul 2>&1
cd /d "%~dp0.python"

echo [2/5] Downloading Python 3.10 portable (~10MB)...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.10.11/python-3.10.11-embed-amd64.zip' -OutFile 'python.zip'"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to download Python. Check your internet connection.
    pause
    exit /b 1
)

echo [3/5] Extracting Python...
powershell -Command "Expand-Archive -Path 'python.zip' -DestinationPath '.' -Force"
del python.zip
powershell -Command "(Get-Content python310._pth) -replace '#import site', 'import site' | Set-Content python310._pth"

echo [4/5] Bootstrapping pip...
powershell -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile 'get-pip.py'"
python.exe get-pip.py --no-warn-script-location
del get-pip.py

echo [5/5] Installing backend packages (first time only)...
python.exe -m pip install -r "%~dp0backend\requirements.txt" --no-warn-script-location
if %errorlevel% equ 0 (
    echo. > "%~dp0.python\.deps_installed"
) else (
    echo [ERROR] Failed to install packages. Check connection and rerun start.bat.
    pause
    exit /b 1
)

echo.
echo [OK] Portable Python setup complete!
echo.
cd /d "%~dp0"

:run_with_portable_python
start "StudyBlossom Service" cmd /k "cd /d "%~dp0backend" && "%~dp0.python\python.exe" main.py"
goto setup_ollama

:run_with_global_python
cd /d "%~dp0backend"
if not exist ".deps_installed" (
    echo [Setup] Installing Python packages - first time only...
    pip install -r requirements.txt
    echo. > .deps_installed
)
echo [Backend] Starting FastAPI...
start "StudyBlossom Service" cmd /k "cd /d "%~dp0backend" && python main.py"

rem ============================================================
rem  OLLAMA + GEMMA3 SETUP (AI features)
rem ============================================================
:setup_ollama
echo.
echo [AI] Checking for Ollama (required for AI features)...

where ollama >nul 2>&1
if %errorlevel% equ 0 (
    echo [AI] Ollama found.
    goto pull_gemma
)

echo [AI] Ollama not found. Installing...
echo [AI] Trying winget first...
winget install Ollama.Ollama -e --silent >nul 2>&1
if %errorlevel% equ 0 (
    echo [AI] Ollama installed via winget.
    rem Refresh PATH so 'ollama' is available in this session
    set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Ollama"
    goto pull_gemma
)

echo [AI] winget unavailable or failed. Downloading Ollama installer directly...
powershell -Command "try { Invoke-WebRequest -Uri 'https://ollama.com/download/OllamaSetup.exe' -OutFile '%TEMP%\OllamaSetup.exe' -UseBasicParsing } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo [AI] Could not download Ollama installer.
    goto ollama_failed
)
echo [AI] Running Ollama installer (silent)...
start /wait "%TEMP%\OllamaSetup.exe" /S
del "%TEMP%\OllamaSetup.exe" >nul 2>&1
timeout /t 3 /nobreak >nul
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\Ollama"

where ollama >nul 2>&1
if %errorlevel% equ 0 (
    echo [AI] Ollama installed successfully.
    goto pull_gemma
)

:ollama_failed
echo.
echo  [!] Ollama could not be installed automatically.
echo      AI chat features will not work without it.
echo      You can install manually from: https://ollama.com
echo.
echo  Press R to retry Ollama setup, or S to skip and continue:
choice /C RS /N
if %errorlevel% equ 1 goto setup_ollama
goto launch_frontend

:pull_gemma
echo [AI] Pulling Gemma3 model (first time ~3-5 GB, runs in background)...
start "" cmd /c "ollama pull gemma3 && echo [AI] Gemma3 ready! || echo [AI] Gemma3 pull failed - retry with: ollama pull gemma3"
echo [AI] Model pull started in background. StudyBlossom will load now.
echo [AI] If Gemma3 is already downloaded, this completes instantly.

rem ============================================================
rem  LAUNCH FRONTEND
rem ============================================================
:launch_frontend
timeout /t 3 /nobreak >nul
echo.
echo [Frontend] Opening StudyBlossom in browser...
cd /d "%~dp0"
start "" "%~dp0index.html"

echo.
echo  ==========================================
echo   StudyBlossom is running!
echo   Frontend : file://%~dp0index.html
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo   Ollama   : http://localhost:11434
echo  ==========================================
echo.
echo  Press any key to stop the backend and exit...
pause >nul

taskkill /f /im StudyBlossomService.exe >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq StudyBlossom Service" >nul 2>&1
echo Backend stopped. Goodbye!
