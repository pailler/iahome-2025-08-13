-- Script pour forcer la création de l'utilisateur admin

-- 1. Désactiver RLS complètement
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Enable all access for debug" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON users;

-- 3. Vérifier les utilisateurs existants
SELECT 'Utilisateurs dans auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

SELECT 'Utilisateurs dans users:' as info;
SELECT id, email, role, created_at FROM users ORDER BY created_at DESC;

-- 4. Créer l'utilisateur admin pour tous les utilisateurs auth existants
INSERT INTO users (id, email, role, created_at)
SELECT 
    au.id,
    au.email,
    'admin',
    au.created_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = au.id
);

-- 5. Mettre à jour tous les utilisateurs existants en admin
UPDATE users SET role = 'admin' WHERE role IS NULL OR role != 'admin';

-- 6. Vérifier le résultat
SELECT 'Résultat final:' as info;
SELECT id, email, role, created_at FROM users ORDER BY created_at DESC;

-- 7. Réactiver RLS avec politique permissive
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for debug" ON users
    FOR ALL USING (true) WITH CHECK (true); 