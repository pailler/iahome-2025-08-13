-- Script pour tester manuellement le webhook Stripe
-- A executer dans l'editeur SQL de Supabase

-- 1. Verifier les acces modules existants
SELECT 'Acces modules existants:' as info;
SELECT 
    ma.id,
    ma.user_id,
    ma.module_id,
    ma.access_type,
    ma.is_active,
    ma.created_at,
    ma.expires_at,
    m.title as module_title,
    p.email as user_email
FROM module_access ma
LEFT JOIN modules m ON ma.module_id = m.id
LEFT JOIN profiles p ON ma.user_id = p.id
ORDER BY ma.created_at DESC;

-- 2. Trouver un utilisateur
SELECT 'Utilisateur disponible:' as info;
SELECT id, email FROM profiles LIMIT 1;

-- 3. Trouver le module StableDiffusion
SELECT 'Module StableDiffusion:' as info;
SELECT id, title, category, price FROM modules WHERE title ILIKE '%stable%' OR title ILIKE '%diffusion%';

-- 4. Instructions pour creer un acces de test
SELECT 'Instructions pour creer un acces de test:' as info;
SELECT 
    '1. Notez l ID utilisateur ci-dessus' as step
UNION ALL
SELECT '2. Notez l ID module StableDiffusion ci-dessus'
UNION ALL
SELECT '3. Decommentez et modifiez la section INSERT ci-dessous'
UNION ALL
SELECT '4. Executez le script modifie'
UNION ALL
SELECT '5. Verifiez la page /encours';

-- 5. Script de creation d'acces de test (a decommenter et modifier)
/*
-- Remplacez USER_ID_HERE et MODULE_ID_HERE par les vraies valeurs
INSERT INTO module_access (user_id, module_id, access_type, expires_at, is_active, metadata)
VALUES (
    'USER_ID_HERE',  -- Remplacez par l'ID utilisateur
    MODULE_ID_HERE,  -- Remplacez par l'ID module StableDiffusion
    'test_webhook',
    NOW() + INTERVAL '72 hours',
    true,
    jsonb_build_object('test_webhook', true, 'created_at', NOW())
);
*/

-- 6. Verifier les acces apres creation
SELECT 'Verification apres creation:' as info;
SELECT 
    ma.id,
    ma.user_id,
    ma.module_id,
    ma.access_type,
    ma.is_active,
    ma.created_at,
    m.title as module_title,
    p.email as user_email
FROM module_access ma
LEFT JOIN modules m ON ma.module_id = m.id
LEFT JOIN profiles p ON ma.user_id = p.id
WHERE ma.access_type = 'test_webhook'
ORDER BY ma.created_at DESC;

-- 7. Statistiques finales
SELECT 'Statistiques finales:' as info;
SELECT 
    'Total acces' as type,
    COUNT(*) as count
FROM module_access
UNION ALL
SELECT 
    'Acces actifs',
    COUNT(*)
FROM module_access
WHERE is_active = true
UNION ALL
SELECT 
    'Acces de test',
    COUNT(*)
FROM module_access
WHERE access_type = 'test_webhook';







