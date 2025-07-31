-- Script pour désactiver complètement RLS sur blog_articles
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Désactiver RLS sur blog_articles
ALTER TABLE blog_articles DISABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est bien désactivé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'blog_articles';

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Enable read access for all users" ON blog_articles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blog_articles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON blog_articles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON blog_articles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON blog_articles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON blog_articles;

-- Vérifier qu'aucune politique n'existe plus
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'blog_articles'; 