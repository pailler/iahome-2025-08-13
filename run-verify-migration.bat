@echo off
echo ========================================
echo Verification de la migration
echo ========================================
echo.

echo Verification de la migration des categories multiples...
node verify-migration.js

echo.
echo ========================================
echo Verification terminee !
echo ========================================
pause 