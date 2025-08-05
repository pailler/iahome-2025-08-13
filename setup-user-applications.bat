@echo off
echo ========================================
echo Configuration des Applications Utilisateur
echo ========================================
echo.

echo 1. Vérification de la table user_applications...
node check-user-applications.js
echo.

echo 2. Insertion de données de test...
node insert-test-user-applications.js
echo.

echo ========================================
echo Configuration terminée !
echo ========================================
echo.
echo Si la table user_applications n'existe pas encore,
echo veuillez d'abord exécuter le script SQL :
echo create-user-applications-table.sql
echo.
echo Puis relancez ce script.
echo.

pause 