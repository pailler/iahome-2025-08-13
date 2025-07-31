-- Script pour forcer la désactivation de toutes les politiques RLS
-- Usage: Exécuter dans Supabase SQL Editor

-- 1. Désactiver RLS sur profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Désactiver RLS sur module_access
ALTER TABLE module_access DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer TOUTES les politiques sur profiles (plus agressif)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON profiles';
    END LOOP;
END $$;

-- 4. Supprimer TOUTES les politiques sur module_access (plus agressif)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'module_access'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON module_access';
    END LOOP;
END $$;

-- 5. Vérifier l'état final
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'module_access');

-- 6. Vérifier qu'il n'y a plus de politiques
SELECT COUNT(*) as policies_on_profiles FROM pg_policies WHERE tablename = 'profiles';
SELECT COUNT(*) as policies_on_module_access FROM pg_policies WHERE tablename = 'module_access'; 