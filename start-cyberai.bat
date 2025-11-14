@echo off
title CyberAI - BYOK Cybersecurity Assistant
color 0A

echo ================================================
echo    CyberAI - BYOK Cybersecurity Assistant
echo ================================================
echo.

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MongoDB not found in PATH
    echo Please install MongoDB from: https://www.mongodb.com/try/download/community
    echo Or make sure it's added to your PATH
    echo.
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found in PATH
    echo Please install Python 3.10+ from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js/Yarn is installed
where yarn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Yarn not found in PATH
    echo Please install Node.js from: https://nodejs.org/
    echo Then install Yarn: npm install -g yarn
    pause
    exit /b 1
)

echo [1/4] Starting MongoDB...
start "MongoDB" /MIN mongod --dbpath "%USERPROFILE%\data\db" 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] MongoDB might already be running or using default dbpath
)
timeout /t 2 /nobreak >nul

echo [2/4] Starting Backend...
cd /d "%~dp0backend"
if not exist venv (
    echo [SETUP] Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    echo [SETUP] Installing backend dependencies...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

start "CyberAI Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && uvicorn server:app --host 127.0.0.1 --port 8001"
echo [OK] Backend starting on http://127.0.0.1:8001
timeout /t 3 /nobreak >nul

echo [3/4] Starting Frontend...
cd /d "%~dp0frontend"
if not exist node_modules (
    echo [SETUP] Installing frontend dependencies...
    call yarn install
)

REM Update .env to use localhost
echo REACT_APP_BACKEND_URL=http://localhost:8001 > .env
echo WDS_SOCKET_PORT=3000 >> .env

start "CyberAI Frontend" cmd /k "cd /d "%~dp0frontend" && yarn start"
echo [OK] Frontend starting on http://localhost:3000

echo.
echo ================================================
echo    CyberAI is starting...
echo ================================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8001/api/
echo.
echo [INFO] Two command windows will open:
echo   1. Backend (Python/FastAPI)
echo   2. Frontend (React)
echo.
echo [INFO] Your browser will open automatically
echo.
echo To stop: Close both command windows
echo.
timeout /t 3 /nobreak >nul

REM Open browser after a delay
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo ================================================
echo Press any key to close this window...
echo (Backend and Frontend will continue running)
echo ================================================
pause >nul
