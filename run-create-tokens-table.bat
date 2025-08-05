@echo off
echo ========================================
echo Creation de la table access_tokens
echo ========================================
echo.

echo Execution du script SQL...
psql "postgresql://postgres.xemtoyzcihmncbrlsmhr:iahome2025@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -f create-access-tokens-table.sql

echo.
echo ========================================
echo Script termine !
echo ========================================
pause 