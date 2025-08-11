-- Activation manuelle de StableDiffusion
-- A executer dans l'editeur SQL de Supabase

-- 1. Trouver le module StableDiffusion
SELECT 'Module StableDiffusion:' as info;
SELECT 
    id,
    title,
    category,
    price
FROM modules 
WHERE title ILIKE '%stable%' OR title ILIKE '%diffusion%' OR title ILIKE '%stablediffusion%';

-- 2. Creer l'acces pour StableDiffusion
-- Utilisateur: ebaace8e-caa6-4a77-b87c-fe66852cb9cc (formateur_tic@hotmail.com)
INSERT INTO module_access (user_id, module_id, access_type, expires_at, is_active, metadata)
SELECT 
    'ebaace8e-caa6-4a77-b87c-fe66852cb9cc',
    m.id,
    'manual_activation',
    NOW() + INTERVAL '72 hours',
    true,
    jsonb_build_object('manual_activation', true, 'created_at', NOW(), 'user_email', 'formateur_tic@hotmail.com')
FROM modules m
WHERE m.title ILIKE '%stable%' OR m.title ILIKE '%diffusion%' OR m.title ILIKE '%stablediffusion%'
AND NOT EXISTS (
    SELECT 1 FROM module_access ma 
    WHERE ma.user_id = 'ebaace8e-caa6-4a77-b87c-fe66852cb9cc' 
    AND ma.module_id = m.id
    AND ma.is_active = true
);

-- 3. Verifier que l'acces a ete cree
SELECT 'Acces cree pour StableDiffusion:' as info;
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
WHERE ma.user_id = 'ebaace8e-caa6-4a77-b87c-fe66852cb9cc'
AND (m.title ILIKE '%stable%' OR m.title ILIKE '%diffusion%')
ORDER BY ma.created_at DESC;

-- 4. Verifier tous les acces de l'utilisateur
SELECT 'Tous les acces de l\'utilisateur:' as info;
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
WHERE ma.user_id = 'ebaace8e-caa6-4a77-b87c-fe66852cb9cc'
ORDER BY ma.created_at DESC;







