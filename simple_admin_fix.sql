-- Script très simple pour créer l'utilisateur admin

-- 1. Désactiver RLS complètement
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Vider la table users
DELETE FROM users;

-- 3. Créer l'utilisateur admin pour tous les utilisateurs auth
INSERT INTO users (id, email, role, created_at)
SELECT 
    au.id,
    au.email,
    'admin',
    au.created_at
FROM auth.users au;

-- 4. Vérifier le résultat
SELECT 'Résultat:' as info, id, email, role FROM users;

-- 5. Réactiver RLS avec politique permissive
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access" ON users;
CREATE POLICY "Enable all access" ON users FOR ALL USING (true) WITH CHECK (true); 