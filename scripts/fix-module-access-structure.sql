-- Script pour corriger la structure de la table module_access
-- À exécuter IMMÉDIATEMENT dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure actuelle de la table
SELECT '🔍 Structure actuelle de module_access:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'module_access' 
ORDER BY ordinal_position;

-- 2. Ajouter la colonne token_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'module_access' 
        AND column_name = 'token_id'
    ) THEN
        ALTER TABLE module_access ADD COLUMN token_id VARCHAR(255);
        RAISE NOTICE 'Colonne token_id ajoutée à module_access';
    ELSE
        RAISE NOTICE 'Colonne token_id existe déjà';
    END IF;
END $$;

-- 3. Vérifier la nouvelle structure
SELECT '✅ Structure corrigée de module_access:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'module_access' 
ORDER BY ordinal_position;

-- 4. Créer des accès pour tous les tokens existants (version corrigée)
INSERT INTO module_access (user_id, module_id, access_type, token_id, expires_at, is_active, metadata)
SELECT 
    at.created_by,
    at.module_id,
    'token' as access_type,
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

-- 5. Vérifier le résultat
SELECT '✅ Correction terminée!' as status;
SELECT COUNT(*) as "Nombre d'accès créés" FROM module_access;







