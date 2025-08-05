-- Script SQL pour créer un token de test pour regispailler@gmail.com
-- Ce script contourne les politiques RLS en utilisant une insertion directe

-- Désactiver temporairement RLS pour la table access_tokens
ALTER TABLE access_tokens DISABLE ROW LEVEL SECURITY;

-- Insérer le token de test
INSERT INTO access_tokens (
    id,
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
    expires_at,
    jwt_token,
    created_at,
    updated_at
) VALUES (
    'test_token_regispailler_ruinedfooocus',
    'Token Test ruinedfooocus - regispailler@gmail.com',
    'Token de test pour ruinedfooocus créé manuellement',
    13,
    'ruinedfooocus',
    'basic',
    ARRAY['access'],
    100,
    0,
    true,
    '4ff83788-7bdb-4633-a693-3ad98006fed5',
    (NOW() + INTERVAL '30 days'),
    'test-jwt-token-regispailler-ruinedfooocus',
    NOW(),
    NOW()
);

-- Réactiver RLS pour la table access_tokens
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;

-- Vérifier que le token a été créé
SELECT 
    id,
    name,
    module_name,
    max_usage,
    current_usage,
    is_active,
    expires_at,
    created_at
FROM access_tokens 
WHERE created_by = '4ff83788-7bdb-4633-a693-3ad98006fed5'
ORDER BY created_at DESC; 