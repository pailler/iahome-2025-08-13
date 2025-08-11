-- Script de test pour l'insertion dans access_tokens
-- Exécuter ce script pour vérifier si la table fonctionne correctement

-- 1. Vérifier que la table existe
SELECT 
    'Table access_tokens existe:' as info,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'access_tokens'
    ) as exists;

-- 2. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'access_tokens'
ORDER BY ordinal_position;

-- 3. Vérifier s'il y a des modules disponibles
SELECT 
    'Modules disponibles:' as info,
    COUNT(*) as count 
FROM modules;

-- 4. Afficher quelques modules
SELECT 
    id,
    title,
    category
FROM modules 
LIMIT 5;

-- 5. Test d'insertion d'un token de test
INSERT INTO access_tokens (
    name,
    description,
    module_id,
    module_name,
    access_level,
    permissions,
    max_usage,
    current_usage,
    is_active,
    created_by,
    expires_at
) VALUES (
    'Token de test',
    'Token de test pour vérifier l''insertion',
    1, -- Assurez-vous que ce module_id existe
    'Module de test',
    'basic',
    ARRAY['access'],
    100,
    0,
    true,
    'test@example.com',
    NOW() + INTERVAL '24 hours'
) ON CONFLICT DO NOTHING;

-- 6. Vérifier que l'insertion a fonctionné
SELECT 
    'Token de test créé:' as info,
    COUNT(*) as count 
FROM access_tokens 
WHERE name = 'Token de test';

-- 7. Afficher le token créé
SELECT 
    id,
    name,
    module_name,
    access_level,
    is_active,
    created_at,
    expires_at
FROM access_tokens 
WHERE name = 'Token de test';

-- 8. Nettoyer le token de test
DELETE FROM access_tokens WHERE name = 'Token de test';
