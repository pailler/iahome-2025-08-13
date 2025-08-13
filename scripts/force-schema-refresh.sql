-- Script pour forcer la mise à jour du cache de schéma Supabase
-- Ce script résout les problèmes de cache de schéma

-- Vérifier la structure actuelle de la table access_tokens
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'access_tokens'
ORDER BY ordinal_position;

-- Forcer la mise à jour des statistiques de la table
ANALYZE public.access_tokens;

-- Vérifier que la colonne created_by existe et est accessible
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'access_tokens'
AND column_name = 'created_by';

-- Tester une insertion avec created_by pour vérifier que ça fonctionne
INSERT INTO public.access_tokens (
    name, 
    description, 
    module_name, 
    access_level, 
    permissions, 
    max_usage, 
    is_active, 
    created_by,
    expires_at
) VALUES (
    'Test Token Schema',
    'Token de test pour vérifier le schéma',
    'test-module',
    'basic',
    ARRAY['access'],
    100,
    true,
    'test-user-id',
    NOW() + INTERVAL '24 hours'
) ON CONFLICT (name) DO NOTHING;

-- Afficher le token de test créé
SELECT 
    id,
    name,
    description,
    module_name,
    created_by,
    created_at,
    expires_at
FROM public.access_tokens 
WHERE name = 'Test Token Schema';

-- Nettoyer le token de test
DELETE FROM public.access_tokens WHERE name = 'Test Token Schema';

-- Afficher la structure finale
SELECT 'Structure de la table access_tokens:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'access_tokens'
ORDER BY ordinal_position;
