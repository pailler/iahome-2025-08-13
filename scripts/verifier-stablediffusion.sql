-- Verification specifique pour StableDiffusion
-- A executer dans l'editeur SQL de Supabase

-- 1. Trouver le module StableDiffusion
SELECT 'Module StableDiffusion:' as info;
SELECT 
    id,
    title,
    category,
    price,
    url,
    is_active
FROM modules 
WHERE title ILIKE '%stable%' OR title ILIKE '%diffusion%' OR title ILIKE '%stablediffusion%';

-- 2. Verifier les tokens pour StableDiffusion
SELECT 'Tokens pour StableDiffusion:' as info;
SELECT 
    at.id,
    at.module_id,
    at.module_name,
    at.created_by,
    at.is_active,
    at.expires_at,
    p.email as user_email
FROM access_tokens at
LEFT JOIN profiles p ON at.created_by = p.id
WHERE at.module_name ILIKE '%stable%' OR at.module_name ILIKE '%diffusion%'
ORDER BY at.created_at DESC;

-- 3. Verifier les acces modules pour StableDiffusion
SELECT 'Acces modules pour StableDiffusion:' as info;
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
WHERE m.title ILIKE '%stable%' OR m.title ILIKE '%diffusion%'
ORDER BY ma.created_at DESC;

-- 4. Verifier les utilisateurs
SELECT 'Utilisateurs disponibles:' as info;
SELECT 
    id,
    email,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 5;

-- 5. Creer un acces manuel pour StableDiffusion (si necessaire)
SELECT 'Pour creer un acces manuel:' as info;
SELECT 
    '1. Notez l\'ID utilisateur ci-dessus' as step
UNION ALL
SELECT '2. Notez l\'ID module StableDiffusion ci-dessus'
UNION ALL
SELECT '3. Decommentez et modifiez la section INSERT ci-dessous'
UNION ALL
SELECT '4. Executez le script modifie';

-- 6. Script de creation manuelle (a decommenter et modifier)
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







