-- Fix simple pour l'automatisation des modules
-- A executer IMMEDIATEMENT dans l'editeur SQL de Supabase

-- 1. Verifier l'etat actuel
SELECT 'Etat actuel:' as info;
SELECT 
    'Tokens actifs' as type,
    COUNT(*) as count
FROM access_tokens 
WHERE is_active = true
UNION ALL
SELECT 
    'Acces modules',
    COUNT(*)
FROM module_access 
WHERE is_active = true;

-- 2. Afficher les tokens existants
SELECT 'Tokens existants:' as info;
SELECT 
    at.id,
    at.created_by,
    at.module_id,
    at.is_active,
    at.expires_at,
    m.title as module_title,
    p.email as user_email
FROM access_tokens at
LEFT JOIN modules m ON at.module_id = m.id
LEFT JOIN profiles p ON at.created_by = p.id
WHERE at.is_active = true
ORDER BY at.created_at DESC;

-- 3. Creer les acces modules manquants (version simplifiee)
INSERT INTO module_access (user_id, module_id, access_type, token_id, expires_at, is_active, metadata)
SELECT 
    at.created_by,
    at.module_id,
    'purchase' as access_type,
    at.id as token_id,
    at.expires_at,
    at.is_active,
    jsonb_build_object(
        'token_id', at.id, 
        'created_from_token', true,
        'generated_at', NOW()
    ) as metadata
FROM access_tokens at
WHERE at.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM module_access ma 
    WHERE ma.user_id = at.created_by 
    AND ma.module_id = at.module_id
    AND ma.is_active = true
);

-- 4. Verifier le resultat
SELECT 'Fix termine!' as status;
SELECT 
    'Tokens actifs' as type,
    COUNT(*) as count
FROM access_tokens 
WHERE is_active = true
UNION ALL
SELECT 
    'Acces modules',
    COUNT(*)
FROM module_access 
WHERE is_active = true;

-- 5. Afficher tous les acces maintenant
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







