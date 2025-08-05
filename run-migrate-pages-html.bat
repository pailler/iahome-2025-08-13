@echo off
echo ========================================
echo   Migration des pages avec contenu HTML
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

echo 🚀 Migration des pages avec contenu HTML...
echo.

node migrate-pages-with-html.js

echo.
echo ========================================
echo   Migration terminée !
echo ========================================
echo.
echo Les pages ont été migrées avec du contenu HTML.
echo.
echo Fonctionnalités ajoutées :
echo - Contenu HTML complet pour chaque page
echo - Meta tags pour le SEO
echo - Aperçu du contenu dans l'administration
echo - Éditeur HTML dans le formulaire de pages
echo.
echo Accédez à l'administration pour voir les changements.
echo.
pause 