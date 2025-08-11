@echo off
echo Configuration Ngrok pour IAHome
echo ================================

REM Créer le dossier ngrok s'il n'existe pas
if not exist "C:\ngrok" mkdir "C:\ngrok"

REM Télécharger ngrok (si pas déjà fait)
if not exist "C:\ngrok\ngrok.exe" (
    echo Téléchargez ngrok depuis https://ngrok.com/download
    echo et placez ngrok.exe dans C:\ngrok\
    pause
    exit
)

REM Aller dans le dossier ngrok
cd /d C:\ngrok

echo.
echo 1. Créez un compte gratuit sur https://ngrok.com/
echo 2. Récupérez votre authtoken dans le dashboard
echo 3. Exécutez: ngrok config add-authtoken YOUR_TOKEN
echo.
echo 4. Pour démarrer le tunnel:
echo    ngrok http 3000
echo.
echo 5. Utilisez l'URL ngrok dans Stripe:
echo    https://abc123.ngrok.io/api/webhooks/stripe
echo.

pause






