@echo off
title Stop CyberAI
color 0C

echo ================================================
echo    Stopping CyberAI Services
echo ================================================
echo.

echo [1/3] Stopping Frontend...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process on port 3000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Stopping Backend...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8001" ^| find "LISTENING"') do (
    echo Killing process on port 8001 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo [3/3] Stopping MongoDB (optional)...
REM Uncomment the next line to stop MongoDB too
REM taskkill /F /IM mongod.exe >nul 2>&1

echo.
echo ================================================
echo    All CyberAI services stopped
echo ================================================
echo.
pause
