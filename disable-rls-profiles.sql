-- Script pour désactiver complètement RLS sur profiles
-- Usage: Exécuter dans Supabase SQL Editor

-- 1. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 2. Désactiver RLS complètement sur profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier que ça fonctionne
SELECT COUNT(*) as profiles_count FROM profiles;

-- 4. Afficher les utilisateurs existants
SELECT id, email, role, created_at FROM profiles ORDER BY created_at DESC LIMIT 5;

-- 5. Vérifier que la table module_access fonctionne
SELECT COUNT(*) as module_access_count FROM module_access; 