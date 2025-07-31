-- Script d'urgence pour corriger les politiques RLS sur profiles
-- Usage: Exécuter dans Supabase SQL Editor

-- 1. Désactiver temporairement RLS sur profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 3. Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer des politiques simples et sûres
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Vérifier que ça fonctionne
SELECT COUNT(*) as profiles_count FROM profiles;

-- 6. Afficher les utilisateurs existants
SELECT id, email, role, created_at FROM profiles ORDER BY created_at DESC LIMIT 5; 