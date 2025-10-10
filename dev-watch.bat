@echo off
REM Weather App Development Auto-Rebuild Script (Windows)
REM This script watches for changes in Frontend files and automatically rebuilds the container

echo 🚀 Weather App Development Auto-Rebuild
echo ======================================

REM Check if docker-compose is available
docker-compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ docker-compose is not installed
    pause
    exit /b 1
)

REM Check if services are running
docker-compose -f docker-compose.multi.yml ps | findstr "weather-app-frontend" >nul
if errorlevel 1 (
    echo ⚠️ Frontend container not running. Starting services...
    docker-compose -f docker-compose.multi.yml up -d
    timeout /t 10 /nobreak >nul
)

echo ✅ Services are running
echo 👀 Watching for Frontend file changes...
echo Press Ctrl+C to stop
echo.

REM Get initial file modification times
for /f %%i in ('dir /b /s Frontend\ ^| findstr /r ".*"') do set LAST_MOD=%%~ti

:watch_loop
    timeout /t 2 /nobreak >nul

    REM Get current file modification times
    for /f %%i in ('dir /b /s Frontend\ ^| findstr /r ".*"') do set CURRENT_MOD=%%~ti

    REM Check if files have changed
    if not "%CURRENT_MOD%"=="%LAST_MOD%" (
        echo 🔄 Frontend changes detected!
        echo 📦 Rebuilding frontend container...

        REM Stop frontend container
        docker-compose -f docker-compose.multi.yml stop frontend

        REM Rebuild frontend image
        docker-compose -f docker-compose.multi.yml build --no-cache frontend

        REM Start frontend container
        docker-compose -f docker-compose.multi.yml up -d frontend

        echo ✅ Frontend rebuilt successfully!
        echo 🌐 Frontend URL: http://localhost:3000
        echo 👀 Continuing to watch for changes...
        echo.

        REM Update last modification time
        set LAST_MOD=%CURRENT_MOD%
    )

    goto watch_loop