-- Script pour vérifier et corriger les rôles des utilisateurs
-- ATTENTION : Ce script modifie les rôles des utilisateurs !

-- 1. Vérifier la structure de la table profiles
SELECT 'Structure de la table profiles' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Vérifier les utilisateurs existants et leurs rôles
SELECT 'Utilisateurs et leurs rôles' as info;
SELECT 
    id,
    email,
    role,
    created_at,
    updated_at
FROM profiles 
ORDER BY created_at DESC;

-- 3. Compter les utilisateurs par rôle
SELECT 'Répartition des utilisateurs par rôle' as info;
SELECT 
    role,
    COUNT(*) as nombre_utilisateurs
FROM profiles 
GROUP BY role
ORDER BY role;

-- 4. Vérifier s'il y a des utilisateurs sans rôle
SELECT 'Utilisateurs sans rôle défini' as info;
SELECT 
    id,
    email,
    role,
    created_at
FROM profiles 
WHERE role IS NULL OR role = ''
ORDER BY created_at DESC;

-- 5. Définir un rôle par défaut pour les utilisateurs sans rôle
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL OR role = '';

-- 6. Créer un utilisateur admin si aucun n'existe
-- Remplacez 'votre-email@example.com' par l'email de l'administrateur
-- INSERT INTO profiles (id, email, role, created_at, updated_at)
-- SELECT 
--     auth.uid(),
--     'votre-email@example.com',
--     'admin',
--     NOW(),
--     NOW()
-- WHERE NOT EXISTS (
--     SELECT 1 FROM profiles WHERE role = 'admin'
-- );

-- 7. Vérifier les utilisateurs admin
SELECT 'Utilisateurs administrateurs' as info;
SELECT 
    id,
    email,
    role,
    created_at
FROM profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 8. Vérifier les permissions sur la table profiles
SELECT 'Politiques RLS sur la table profiles' as info;
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
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 9. Test de connexion avec un utilisateur admin
-- Cette requête simule une vérification de rôle admin
SELECT 'Test de vérification de rôle admin' as info;
SELECT 
    p.id,
    p.email,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '✅ Utilisateur admin'
        ELSE '❌ Utilisateur non-admin'
    END as statut_admin
FROM profiles p
WHERE p.role = 'admin'
LIMIT 5; 