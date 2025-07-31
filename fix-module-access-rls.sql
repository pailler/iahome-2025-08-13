-- Script pour corriger les politiques RLS sur module_access
-- Usage: Exécuter dans Supabase SQL Editor

-- 1. Supprimer toutes les politiques existantes sur module_access
DROP POLICY IF EXISTS "Users can view own module access" ON module_access;
DROP POLICY IF EXISTS "Users can insert own module access" ON module_access;
DROP POLICY IF EXISTS "Users can update own module access" ON module_access;
DROP POLICY IF EXISTS "Users can delete own module access" ON module_access;
DROP POLICY IF EXISTS "Enable read access for all users" ON module_access;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON module_access;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON module_access;

-- 2. Désactiver temporairement RLS sur module_access
ALTER TABLE module_access DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier que l'insertion fonctionne
-- (Test manuel à faire après)

-- 4. Optionnel : Réactiver RLS avec des politiques simples
-- ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own module access" ON module_access
--     FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own module access" ON module_access
--     FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own module access" ON module_access
--     FOR UPDATE USING (auth.uid() = user_id);

-- 5. Vérifier l'état actuel
SELECT COUNT(*) as module_access_count FROM module_access; 