-- Script de test pour vérifier les tokens de formateur_tic@hotmail.com
-- À exécuter dans votre base de données Supabase

-- 1. Vérifier que l'utilisateur formateur_tic@hotmail.com existe
SELECT 
    'Vérification utilisateur formateur_tic' as test,
    id,
    email,
    created_at
FROM profiles 
WHERE email = 'formateur_tic@hotmail.com';

-- 2. Compter les tokens actifs de formateur_tic
SELECT 
    'Nombre de tokens actifs' as test,
    COUNT(*) as total_tokens
FROM access_tokens at
JOIN profiles p ON at.created_by = p.id
WHERE p.email = 'formateur_tic@hotmail.com' 
AND at.is_active = true;

-- 3. Lister tous les tokens de formateur_tic avec leurs détails
SELECT 
    'Détails des tokens' as test,
    at.id,
    at.name,
    at.module_name,
    at.access_level,
    at.max_usage,
    at.current_usage,
    at.is_active,
    at.created_at,
    at.expires_at,
    m.title as module_title,
    m.category as module_category,
    m.price as module_price
FROM access_tokens at
JOIN profiles p ON at.created_by = p.id
LEFT JOIN modules m ON at.module_id = m.id
WHERE p.email = 'formateur_tic@hotmail.com' 
AND at.is_active = true
ORDER BY at.created_at DESC;

-- 4. Vérifier les modules associés aux tokens
SELECT 
    'Modules associés aux tokens' as test,
    m.id,
    m.title,
    m.category,
    m.price,
    COUNT(at.id) as token_count
FROM modules m
JOIN access_tokens at ON m.id = at.module_id
JOIN profiles p ON at.created_by = p.id
WHERE p.email = 'formateur_tic@hotmail.com' 
AND at.is_active = true
GROUP BY m.id, m.title, m.category, m.price
ORDER BY m.title;

-- 5. Vérifier les tokens expirés
SELECT 
    'Tokens expirés' as test,
    at.id,
    at.name,
    at.module_name,
    at.expires_at,
    CASE 
        WHEN at.expires_at < NOW() THEN 'EXPIRÉ'
        ELSE 'ACTIF'
    END as status
FROM access_tokens at
JOIN profiles p ON at.created_by = p.id
WHERE p.email = 'formateur_tic@hotmail.com' 
AND at.is_active = true
AND at.expires_at IS NOT NULL
ORDER BY at.expires_at;

-- 6. Statistiques d'utilisation des tokens
SELECT 
    'Statistiques d\'utilisation' as test,
    at.module_name,
    at.max_usage,
    at.current_usage,
    ROUND((at.current_usage::float / at.max_usage::float) * 100, 2) as usage_percentage,
    CASE 
        WHEN at.current_usage >= at.max_usage THEN 'ÉPUISÉ'
        WHEN (at.current_usage::float / at.max_usage::float) >= 0.9 THEN 'CRITIQUE'
        WHEN (at.current_usage::float / at.max_usage::float) >= 0.7 THEN 'ÉLEVÉ'
        ELSE 'NORMAL'
    END as usage_status
FROM access_tokens at
JOIN profiles p ON at.created_by = p.id
WHERE p.email = 'formateur_tic@hotmail.com' 
AND at.is_active = true
AND at.max_usage IS NOT NULL
ORDER BY usage_percentage DESC;

-- 7. Vérifier les permissions des tokens
SELECT 
    'Permissions des tokens' as test,
    at.name,
    at.module_name,
    at.permissions,
    at.access_level
FROM access_tokens at
JOIN profiles p ON at.created_by = p.id
WHERE p.email = 'formateur_tic@hotmail.com' 
AND at.is_active = true
ORDER BY at.module_name;

-- 8. Résumé global
SELECT 
    'Résumé global' as test,
    COUNT(*) as total_tokens,
    COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as tokens_expires,
    COUNT(CASE WHEN current_usage >= max_usage THEN 1 END) as tokens_epuises,
    COUNT(CASE WHEN is_active = true THEN 1 END) as tokens_actifs,
    AVG(current_usage::float / NULLIF(max_usage::float, 0)) * 100 as usage_moyen_pourcent
FROM access_tokens at
JOIN profiles p ON at.created_by = p.id
WHERE p.email = 'formateur_tic@hotmail.com';
