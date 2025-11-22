@echo off
REM Routine Guide - Quick Start Script for Windows
REM This script helps you get started quickly

echo.
echo ============================================
echo   Routine Guide - Quick Start
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js 20 or higher from https://nodejs.org
    exit /b 1
)

echo [OK] Node.js version:
node -v
echo.

REM Check if .env exists
if not exist ".env" (
    echo [INFO] Creating .env file from .env.example...
    copy .env.example .env
    echo [WARN] Please edit .env with your database credentials
    echo.
)

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

REM Generate Prisma client
echo.
echo [INFO] Generating Prisma client...
call npm run db:generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma client
    exit /b 1
)

REM Ask about migrations
echo.
set /p MIGRATE="Do you want to run database migrations? (y/n): "
if /i "%MIGRATE%"=="y" (
    echo [INFO] Running migrations...
    call npm run db:migrate
    if %ERRORLEVEL% NEQ 0 (
        echo [WARN] Migration failed. Make sure your DATABASE_URL is correct in .env
        exit /b 1
    )

    REM Ask about seeding
    set /p SEED="Do you want to seed the database with sample data? (y/n): "
    if /i "%SEED%"=="y" (
        echo [INFO] Seeding database...
        call npm run db:seed
    )
)

echo.
echo ============================================
echo   Setup complete!
echo ============================================
echo.
echo Next steps:
echo   1. Edit .env with your configuration
echo   2. Run 'npm run start:dev' to start the API
echo   3. Visit http://localhost:3000/api/docs
echo.
echo Happy coding!
echo.
pause
