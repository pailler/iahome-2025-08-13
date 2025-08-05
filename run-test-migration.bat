@echo off
echo ========================================
echo   Test de migration des pages IAhome
echo ========================================
echo.

echo Verifying Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Checking for .env file...
if not exist ".env" (
    echo ERROR: .env file not found
    echo Please create a .env file with your Supabase credentials
    echo.
    echo Required variables:
    echo - NEXT_PUBLIC_SUPABASE_URL
    echo - SUPABASE_SERVICE_ROLE_KEY
    echo.
    pause
    exit /b 1
)

echo .env file found

echo.
echo Running migration tests...
echo.

node test-migration-pages.js

echo.
echo Test execution completed.
pause 