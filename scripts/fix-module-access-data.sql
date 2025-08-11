-- Script pour vérifier et corriger les données module_access
-- À exécuter après avoir créé la table module_access

-- 1. Vérifier les modules existants
SELECT 'Modules existants:' as info;
SELECT id, title, category, price FROM modules ORDER BY id;

-- 2. Vérifier les utilisateurs existants
SELECT 'Utilisateurs existants:' as info;
SELECT id, email FROM profiles ORDER BY id;

-- 3. Vérifier les accès modules existants
SELECT 'Accès modules existants:' as info;
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

-- 4. Vérifier les tokens d'accès existants
SELECT 'Tokens d\'accès existants:' as info;
SELECT 
    at.id,
    at.module_id,
    at.module_name,
    at.access_level,
    at.is_active,
    at.created_at,
    at.expires_at,
    at.created_by,
    p.email as created_by_email
FROM access_tokens at
LEFT JOIN profiles p ON at.created_by = p.id
ORDER BY at.created_at DESC;

-- 5. Créer des accès modules pour les tokens existants qui n'en ont pas
INSERT INTO module_access (user_id, module_id, access_type, token_id, expires_at, is_active, metadata)
SELECT 
    at.created_by,
    at.module_id,
    'token' as access_type,
    at.id as token_id,
    at.expires_at,
    at.is_active,
    jsonb_build_object(
        'token_id', at.id,
        'access_level', at.access_level,
        'created_from_token', true
    ) as metadata
FROM access_tokens at
WHERE at.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM module_access ma 
    WHERE ma.user_id = at.created_by 
    AND ma.module_id = at.module_id
    AND ma.is_active = true
);

-- 6. Afficher les nouveaux accès créés
SELECT 'Nouveaux accès créés:' as info;
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
WHERE ma.metadata->>'created_from_token' = 'true'
ORDER BY ma.created_at DESC;

-- 7. Statistiques finales
SELECT 'Statistiques finales:' as info;
SELECT 
    'Total accès modules' as metric,
    COUNT(*) as count
FROM module_access
UNION ALL
SELECT 
    'Accès actifs',
    COUNT(*)
FROM module_access
WHERE is_active = true
UNION ALL
SELECT 
    'Accès expirés',
    COUNT(*)
FROM module_access
WHERE expires_at IS NOT NULL AND expires_at < NOW()
UNION ALL
SELECT 
    'Accès sans expiration',
    COUNT(*)
FROM module_access
WHERE expires_at IS NULL;








