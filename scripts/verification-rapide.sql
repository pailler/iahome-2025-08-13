-- Verification rapide de l'etat du system
-- A executer dans l'editeur SQL de Supabase

-- 1. Verifier les acces modules
SELECT 'Acces modules:' as info;
SELECT COUNT(*) as "Nombre d'acces" FROM module_access WHERE is_active = true;

-- 2. Afficher les acces existants
SELECT 'Details des acces:' as info;
SELECT 
    ma.id,
    ma.user_id,
    ma.module_id,
    ma.access_type,
    ma.is_active,
    m.title as module_title,
    p.email as user_email
FROM module_access ma
LEFT JOIN modules m ON ma.module_id = m.id
LEFT JOIN profiles p ON ma.user_id = p.id
ORDER BY ma.created_at DESC;

-- 3. Verifier les modules disponibles
SELECT 'Modules disponibles:' as info;
SELECT id, title, category, price FROM modules ORDER BY id;

-- 4. Verifier les utilisateurs
SELECT 'Utilisateurs:' as info;
SELECT id, email FROM profiles ORDER BY id;

-- 5. Test simple
SELECT 'Test simple:' as info;
SELECT 
    'La page /encours devrait afficher' as message,
    COUNT(*) as "nombre de modules"
FROM module_access 
WHERE is_active = true;







