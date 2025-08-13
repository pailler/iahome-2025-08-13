-- Script pour corriger le probleme de la colonne created_by
-- Executez ce script dans Supabase SQL Editor

-- 1. Verifier si la colonne created_by existe
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'access_tokens'
AND column_name = 'created_by';

-- 2. Si la colonne n'existe pas, la creer
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'access_tokens'
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.access_tokens
        ADD COLUMN created_by VARCHAR(255);
        
        RAISE NOTICE 'Colonne created_by ajoutee a la table access_tokens';
    ELSE
        RAISE NOTICE 'La colonne created_by existe deja';
    END IF;
END $$;

-- 3. Forcer la mise a jour des statistiques
ANALYZE public.access_tokens;

-- 4. Verifier la structure finale
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'access_tokens'
ORDER BY ordinal_position;

-- 5. Nettoyer les anciens tests s'ils existent
DELETE FROM public.access_tokens WHERE name = 'Test Created By';

-- 6. Tester une insertion simple
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
    'Test Created By',
    'Test de la colonne created_by',
    'test-module',
    'basic',
    ARRAY['access'],
    100,
    true,
    'test-user-123',
    NOW() + INTERVAL '1 hour'
);

-- 7. Verifier l'insertion
SELECT 
    id,
    name,
    created_by,
    created_at
FROM public.access_tokens 
WHERE name = 'Test Created By';

-- 8. Nettoyer le test
DELETE FROM public.access_tokens WHERE name = 'Test Created By';

-- 9. Confirmation
SELECT 'Colonne created_by corrigee avec succes!' as status;
