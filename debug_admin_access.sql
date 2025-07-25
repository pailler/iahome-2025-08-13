-- Script de debug pour l'accès admin

-- 1. Vérifier la structure de la table users
SELECT 'Structure de la table users:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Vérifier les utilisateurs dans auth.users
SELECT 'Utilisateurs dans auth.users:' as info;
SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Vérifier les utilisateurs dans users
SELECT 'Utilisateurs dans users:' as info;
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 4. Désactiver RLS temporairement pour debug
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 5. Créer ou mettre à jour l'utilisateur admin
-- Remplacez 'formateur_tic@hotmail.com' par l'email de l'utilisateur connecté
INSERT INTO users (id, email, role, created_at)
SELECT 
    au.id,
    au.email,
    'admin',
    au.created_at
FROM auth.users au
WHERE au.email = 'formateur_tic@hotmail.com'
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    email = EXCLUDED.email;

-- 6. Vérifier le résultat
SELECT 'Résultat final:' as info;
SELECT id, email, role, created_at 
FROM users 
WHERE email = 'formateur_tic@hotmail.com';

-- 7. Réactiver RLS avec une politique permissive
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Enable all access for debug" ON users;

-- Créer une politique permissive
CREATE POLICY "Enable all access for debug" ON users
    FOR ALL USING (true) WITH CHECK (true); 