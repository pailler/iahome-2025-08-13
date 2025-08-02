-- Script pour vérifier et corriger les permissions Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier les politiques RLS actuelles
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
WHERE tablename = 'cartes';

-- 2. Vérifier si RLS est activé sur la table cartes
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'cartes';

-- 3. Vérifier les permissions de l'utilisateur anon
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'cartes' 
AND grantee = 'anon';

-- 4. Créer une politique pour permettre les mises à jour (si nécessaire)
-- Décommentez les lignes suivantes si les politiques sont trop restrictives

/*
-- Désactiver RLS temporairement pour les tests
ALTER TABLE cartes DISABLE ROW LEVEL SECURITY;

-- Ou créer une politique permissive pour les mises à jour
CREATE POLICY "Enable update for authenticated users" ON cartes
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Ou permettre toutes les opérations pour les utilisateurs authentifiés
CREATE POLICY "Enable all operations for authenticated users" ON cartes
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
*/

-- 5. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cartes'
ORDER BY ordinal_position; 