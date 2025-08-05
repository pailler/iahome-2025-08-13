@echo off
echo ========================================
echo Migration vers les categories multiples
echo ========================================
echo.

echo 1. Creation de la table module_categories...
node create-module-categories-table.sql

echo.
echo 2. Migration des donnees existantes...
node migrate-to-multiple-categories.js

echo.
echo 3. Ajout des categories multiples...
node add-multiple-categories.js

echo.
echo ========================================
echo Migration terminee !
echo ========================================
pause 