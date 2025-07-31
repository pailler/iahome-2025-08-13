-- Script pour corriger les politiques RLS sur blog_articles
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Désactiver temporairement RLS sur blog_articles
ALTER TABLE blog_articles DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer les politiques existantes (si elles existent)
DROP POLICY IF EXISTS "Enable read access for all users" ON blog_articles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blog_articles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON blog_articles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON blog_articles;

-- 3. Créer de nouvelles politiques plus permissives

-- Politique de lecture : tout le monde peut lire
CREATE POLICY "Enable read access for all users" ON blog_articles
    FOR SELECT USING (true);

-- Politique d'insertion : utilisateurs authentifiés peuvent créer
CREATE POLICY "Enable insert for authenticated users only" ON blog_articles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique de mise à jour : utilisateurs authentifiés peuvent modifier
CREATE POLICY "Enable update for authenticated users only" ON blog_articles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique de suppression : utilisateurs authentifiés peuvent supprimer
CREATE POLICY "Enable delete for authenticated users only" ON blog_articles
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Réactiver RLS
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

-- 5. Vérifier les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'blog_articles';

-- 6. Vérifier le statut RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'blog_articles'; 