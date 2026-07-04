@echo off
title StudyBloom - Startup
color 0D
echo.
echo  ==========================================
echo   StudyBloom - Starting...
echo  ==========================================
echo.

rem -- Priority 1: Pre-compiled EXE --
if exist "%~dp0backend\dist\StudyBloomBackend.exe" (
    echo [EXE] Pre-compiled executable found! Starting backend...
    start "StudyBloom Backend" cmd /k "cd /d "%~dp0backend\dist" && StudyBloomBackend.exe"
    goto launch_frontend
)

rem -- Priority 2: Global Python --
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [Python] Global Python detected. Using it.
    goto run_with_global_python
)

rem -- Priority 3: Local portable Python --
if exist "%~dp0.python\python.exe" if exist "%~dp0.python\.deps_installed" (
    echo [Python] Local portable Python detected.
    goto run_with_portable_python
)

rem -- Priority 4: Auto-download portable Python --
echo [Setup] No Python or pre-built EXE detected.
echo [Setup] StudyBloom will download a portable Python environment.
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

echo [2/5] Downloading Python 3.10 portable zip (~10MB)...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.10.11/python-3.10.11-embed-amd64.zip' -OutFile 'python.zip'"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to download Python. Check your internet connection.
    pause
    exit /b 1
)

echo [3/5] Extracting Python...
powershell -Command "Expand-Archive -Path 'python.zip' -DestinationPath '.' -Force"
del python.zip

rem Configure site
powershell -Command "(Get-Content python310._pth) -replace '#import site', 'import site' | Set-Content python310._pth"

echo [4/5] Bootstrapping pip...
powershell -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile 'get-pip.py'"
python.exe get-pip.py --no-warn-script-location
del get-pip.py

echo [5/5] Installing backend packages (first time, may take a few minutes)...
python.exe -m pip install -r "%~dp0backend\requirements.txt" --no-warn-script-location
if %errorlevel% equ 0 (
    echo. > "%~dp0.python\.deps_installed"
) else (
    echo [ERROR] Failed to install packages. Check internet connection and rerun start.bat.
    pause
    exit /b 1
)

echo.
echo [OK] Portable Python setup complete!
echo.
cd /d "%~dp0"

:run_with_portable_python
start "StudyBloom Backend" cmd /k "cd /d "%~dp0backend" && "%~dp0.python\python.exe" main.py"
goto launch_frontend

:run_with_global_python
cd /d "%~dp0backend"
if not exist ".deps_installed" (
    echo [Setup] Installing Python packages - first time only...
    pip install -r requirements.txt
    echo. > .deps_installed
)
echo [Backend] Starting FastAPI...
start "StudyBloom Backend" cmd /k "cd /d "%~dp0backend" && python main.py"

:launch_frontend
timeout /t 4 /nobreak >nul
echo [Frontend] Opening StudyBloom in browser...
cd /d "%~dp0"
start "" "%~dp0index.html"

echo.
echo  ==========================================
echo   StudyBloom is running!
echo   Frontend: file://%~dp0index.html
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo  ==========================================
echo.
echo  Press any key to stop the backend...
pause >nul

taskkill /f /im StudyBloomBackend.exe >nul 2>&1
taskkill /f /fi "WINDOWTITLE eq StudyBloom Backend" >nul 2>&1
echo Backend stopped. Goodbye!
