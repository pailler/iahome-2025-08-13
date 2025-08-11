-- Script pour tester manuellement l'ajout d'un module
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Trouver un utilisateur de test
SELECT '👤 Utilisateur de test:' as info;
SELECT id, email FROM profiles LIMIT 1;

-- 2. Trouver un module de test (StableDiffusion)
SELECT '📦 Module StableDiffusion:' as info;
SELECT id, title, category, price FROM modules WHERE title ILIKE '%stable%' OR title ILIKE '%diffusion%';

-- 3. Créer un accès de test manuel (remplacez les valeurs par vos vraies données)
-- Remplacez 'USER_ID_HERE' par l'ID d'un vrai utilisateur
-- Remplacez 'MODULE_ID_HERE' par l'ID du module StableDiffusion

/*
INSERT INTO module_access (user_id, module_id, access_type, expires_at, is_active, metadata)
VALUES (
    'USER_ID_HERE',  -- Remplacez par un vrai user_id
    MODULE_ID_HERE,  -- Remplacez par le module_id de StableDiffusion
    'test_manual',
    NOW() + INTERVAL '72 hours',
    true,
    jsonb_build_object('test_manual', true, 'created_at', NOW())
);
*/

-- 4. Vérifier que l'accès a été créé
SELECT '🔍 Vérification de l\'accès créé:' as info;
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
WHERE ma.access_type = 'test_manual'
ORDER BY ma.created_at DESC;

-- 5. Instructions pour le test manuel
SELECT '📝 Instructions pour le test:' as info;
SELECT 
    '1. Remplacez USER_ID_HERE par un vrai user_id' as step
UNION ALL
SELECT '2. Remplacez MODULE_ID_HERE par le module_id de StableDiffusion'
UNION ALL
SELECT '3. Décommentez la section INSERT INTO'
UNION ALL
SELECT '4. Exécutez le script'
UNION ALL
SELECT '5. Vérifiez la page /encours'
UNION ALL
SELECT '6. Le module devrait apparaître immédiatement';







