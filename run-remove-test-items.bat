@echo off
echo ========================================
echo   Suppression des elements de menu de test
echo ========================================
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si le fichier .env existe
if not exist ".env" (
    echo ❌ Le fichier .env n'existe pas
    echo Veuillez créer le fichier .env avec vos variables d'environnement Supabase
    pause
    exit /b 1
)

echo ✅ Node.js détecté
echo ✅ Fichier .env trouvé
echo.

echo 🧹 Suppression des éléments de menu de test "Éditeur HTML"...
echo.

node remove-test-menu-items.js

echo.
echo ========================================
echo   Nettoyage terminé !
echo ========================================
echo.
echo Les boutons de test "Éditeur HTML" ont été supprimés
echo de la navigation du site.
echo.
echo Rafraîchissez votre navigateur pour voir les changements.
echo.
pause 