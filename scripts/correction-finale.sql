-- Correction finale pour l'automatisation des modules
-- A executer IMMEDIATEMENT dans l'editeur SQL de Supabase

-- 1. Verifier les tokens existants
SELECT 'Tokens existants:' as info;
SELECT 
    at.id,
    at.created_by,
    at.module_id,
    at.is_active,
    at.expires_at,
    m.title as module_title
FROM access_tokens at
LEFT JOIN modules m ON at.module_id = m.id
WHERE at.is_active = true;

-- 2. Creer les acces modules manquants
INSERT INTO module_access (user_id, module_id, access_type, token_id, expires_at, is_active, metadata)
SELECT 
    at.created_by,
    at.module_id,
    'purchase' as access_type,
    at.id as token_id,
    at.expires_at,
    at.is_active,
    jsonb_build_object('token_id', at.id, 'created_from_token', true) as metadata
FROM access_tokens at
WHERE at.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM module_access ma 
    WHERE ma.user_id = at.created_by 
    AND ma.module_id = at.module_id
    AND ma.is_active = true
);

-- 3. Verifier le resultat
SELECT 'Correction terminee!' as status;
SELECT COUNT(*) as "Nombre d'acces crees" FROM module_access;

-- 4. Afficher tous les acces maintenant
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







