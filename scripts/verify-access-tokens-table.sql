-- Script de vérification et correction de la table access_tokens
-- Exécuter ce script pour s'assurer que la table est correctement configurée

-- 1. Vérifier si la table existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'access_tokens') THEN
        RAISE NOTICE 'La table access_tokens n''existe pas. Création...';
        
        CREATE TABLE access_tokens (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
            module_name VARCHAR(100) NOT NULL,
            access_level VARCHAR(50) DEFAULT 'basic',
            permissions TEXT[] DEFAULT ARRAY['access'],
            max_usage INTEGER DEFAULT 1000,
            current_usage INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            jwt_token TEXT,
            last_used_at TIMESTAMP,
            usage_log JSONB DEFAULT '[]'::jsonb
        );
        
        -- Créer les index
        CREATE INDEX IF NOT EXISTS idx_access_tokens_module_name ON access_tokens(module_name);
        CREATE INDEX IF NOT EXISTS idx_access_tokens_is_active ON access_tokens(is_active);
        CREATE INDEX IF NOT EXISTS idx_access_tokens_module_id ON access_tokens(module_id);
        
        RAISE NOTICE 'Table access_tokens créée avec succès.';
    ELSE
        RAISE NOTICE 'La table access_tokens existe déjà.';
    END IF;
END $$;

-- 2. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'access_tokens'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'access_tokens';

-- 4. Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'access_tokens';

-- 5. Compter les tokens existants
SELECT 
    'Nombre total de tokens:' as info,
    COUNT(*) as count 
FROM access_tokens
UNION ALL
SELECT 
    'Tokens actifs:' as info,
    COUNT(*) as count 
FROM access_tokens 
WHERE is_active = true
UNION ALL
SELECT 
    'Tokens expirés:' as info,
    COUNT(*) as count 
FROM access_tokens 
WHERE expires_at < NOW();

-- 6. Afficher quelques exemples de tokens
SELECT 
    id,
    name,
    module_name,
    access_level,
    is_active,
    created_at,
    expires_at
FROM access_tokens 
ORDER BY created_at DESC 
LIMIT 5;
