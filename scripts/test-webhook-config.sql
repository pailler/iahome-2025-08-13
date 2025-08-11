-- Test de configuration webhook et creation manuelle
-- A executer dans l'editeur SQL de Supabase

-- 1. Verifier tous les modules disponibles
SELECT 'Tous les modules:' as info;
SELECT 
    id,
    title,
    category,
    price
FROM modules 
ORDER BY id;

-- 2. Verifier tous les utilisateurs
SELECT 'Tous les utilisateurs:' as info;
SELECT 
    id,
    email,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- 3. Verifier tous les acces existants
SELECT 'Tous les acces modules:' as info;
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
ORDER BY ma.created_at DESC;

-- 4. Creer un acces manuel pour StableDiffusion
-- Remplacez USER_ID et MODULE_ID par les vraies valeurs du script ci-dessus
SELECT 'Pour activer StableDiffusion manuellement:' as info;
SELECT 
    '1. Notez l\'ID utilisateur ci-dessus' as step
UNION ALL
SELECT '2. Notez l\'ID module StableDiffusion ci-dessus'
UNION ALL
SELECT '3. Decommentez et modifiez la section INSERT ci-dessous'
UNION ALL
SELECT '4. Executez le script modifie';

-- 5. Script de creation manuelle (a decommenter et modifier)
/*
-- Remplacez USER_ID_HERE et MODULE_ID_HERE par les vraies valeurs
INSERT INTO module_access (user_id, module_id, access_type, expires_at, is_active, metadata)
VALUES (
    'USER_ID_HERE',  -- Remplacez par l'ID utilisateur
    MODULE_ID_HERE,  -- Remplacez par l'ID module StableDiffusion
    'manual_activation',
    NOW() + INTERVAL '72 hours',
    true,
    jsonb_build_object('manual_activation', true, 'created_at', NOW())
);
*/







