-- Script de diagnostic pour les problèmes d'inscription
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si la table profiles existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- 2. Vérifier la structure de la table profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Vérifier les politiques RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. Vérifier les triggers sur auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';

-- 5. Vérifier les fonctions existantes
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name LIKE '%user%';

-- 6. Vérifier les permissions sur la table profiles
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles';

-- 7. Vérifier s'il y a des contraintes qui pourraient bloquer l'insertion
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';

-- 8. Vérifier les logs d'erreur récents (si disponibles)
-- Note: Cette requête peut ne pas fonctionner selon les permissions
SELECT 
    log_time,
    log_level,
    log_message
FROM pg_stat_activity 
WHERE state = 'active'
AND query LIKE '%profiles%'
ORDER BY log_time DESC
LIMIT 10; 