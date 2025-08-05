@echo off
echo Création de la table user_applications dans Supabase...
echo.

REM Remplacez ces valeurs par vos propres credentials Supabase
set SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
set SUPABASE_DB_PASSWORD=votre_mot_de_passe_db

REM Exécuter le script SQL
psql "postgresql://postgres:%SUPABASE_DB_PASSWORD%@db.xemtoyzcihmncbrlsmhr.supabase.co:5432/postgres" -f create-user-applications-table.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Table user_applications créée avec succès !
    echo.
    echo 📋 Fonctionnalités ajoutées :
    echo    - Gestion des applications par utilisateur
    echo    - Contrôle d'accès avec RLS
    echo    - Fonctions utilitaires pour la gestion
    echo    - Index pour les performances
    echo.
) else (
    echo.
    echo ❌ Erreur lors de la création de la table
    echo.
    echo 💡 Vérifiez que :
    echo    - Le mot de passe de la base de données est correct
    echo    - Vous avez les permissions nécessaires
    echo    - La connexion à Supabase fonctionne
    echo.
)

pause 