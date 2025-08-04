-- Script pour corriger les politiques RLS de la table modules
-- ATTENTION : Ce script modifie les règles de sécurité !

-- 1. Vérifier l'état actuel de RLS sur la table modules
SELECT 'État actuel de RLS sur la table modules' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modules';

-- 2. Vérifier les politiques existantes
SELECT 'Politiques existantes sur la table modules' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'modules';

-- 3. Activer RLS sur la table modules si ce n'est pas déjà fait
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Enable read access for all users" ON modules;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON modules;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON modules;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON modules;
DROP POLICY IF EXISTS "Enable full access for admins" ON modules;

-- 5. Créer les nouvelles politiques RLS

-- Politique 1 : Lecture publique (tous les utilisateurs peuvent voir les modules)
CREATE POLICY "Enable read access for all users" ON modules
    FOR SELECT
    USING (true);

-- Politique 2 : Insertion pour les utilisateurs authentifiés avec rôle admin
CREATE POLICY "Enable insert access for admins" ON modules
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique 3 : Mise à jour pour les utilisateurs authentifiés avec rôle admin
CREATE POLICY "Enable update access for admins" ON modules
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique 4 : Suppression pour les utilisateurs authentifiés avec rôle admin
CREATE POLICY "Enable delete access for admins" ON modules
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 6. Alternative : Politique plus permissive pour les tests (à utiliser temporairement)
-- DROP POLICY IF EXISTS "Enable full access for authenticated users" ON modules;
-- CREATE POLICY "Enable full access for authenticated users" ON modules
--     FOR ALL
--     USING (auth.role() = 'authenticated')
--     WITH CHECK (auth.role() = 'authenticated');

-- 7. Alternative : Désactiver RLS temporairement pour les tests (DANGEREUX en production)
-- ALTER TABLE modules DISABLE ROW LEVEL SECURITY;

-- 8. Vérifier les nouvelles politiques
SELECT 'Nouvelles politiques sur la table modules' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'modules'
ORDER BY policyname;

-- 9. Test de lecture publique
SELECT 'Test de lecture publique' as info;
SELECT COUNT(*) as nombre_modules_visibles FROM modules;

-- 10. Vérifier les rôles des utilisateurs
SELECT 'Rôles des utilisateurs' as info;
SELECT 
    id,
    email,
    role,
    created_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5; 