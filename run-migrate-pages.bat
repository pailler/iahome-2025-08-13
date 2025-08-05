@echo off
echo ========================================
echo   Migration des pages statiques IAhome
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
echo Available commands:
echo 1. migrate - Migrer les nouvelles pages
echo 2. update  - Mettre a jour les pages existantes  
echo 3. stats   - Afficher les statistiques
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Executing: node migrate-static-pages.js migrate
    node migrate-static-pages.js migrate
) else if "%choice%"=="2" (
    echo.
    echo Executing: node migrate-static-pages.js update
    node migrate-static-pages.js update
) else if "%choice%"=="3" (
    echo.
    echo Executing: node migrate-static-pages.js stats
    node migrate-static-pages.js stats
) else (
    echo Invalid choice. Please run the script again.
)

echo.
echo Script execution completed.
pause 