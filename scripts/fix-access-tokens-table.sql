-- Script pour corriger la table access_tokens et résoudre le problème de séquence
-- Exécuter ce script dans Supabase SQL Editor

-- 1. Supprimer la table existante pour repartir proprement
DROP TABLE IF EXISTS access_tokens CASCADE;

-- 2. Créer la table access_tokens avec la bonne configuration
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    jwt_token TEXT,
    last_used_at TIMESTAMP,
    usage_log JSONB DEFAULT '[]'::jsonb
);

-- 3. Créer les index
CREATE INDEX idx_access_tokens_module_name ON access_tokens(module_name);
CREATE INDEX idx_access_tokens_is_active ON access_tokens(is_active);
CREATE INDEX idx_access_tokens_module_id ON access_tokens(module_id);
CREATE INDEX idx_access_tokens_expires_at ON access_tokens(expires_at);

-- 4. Vérifier que la table est créée correctement
SELECT 
    'Table access_tokens créée:' as info,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'access_tokens'
    ) as exists;

-- 5. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'access_tokens'
ORDER BY ordinal_position;

-- 6. Vérifier la séquence
SELECT 
    'Séquence pour access_tokens:' as info,
    pg_get_serial_sequence('access_tokens', 'id') as sequence_name;

-- 7. Vérifier les modules disponibles
SELECT 
    'Modules disponibles:' as info,
    COUNT(*) as count 
FROM modules;

-- 8. Afficher les modules avec leurs IDs
SELECT 
    id,
    title,
    category
FROM modules 
ORDER BY id;

-- 9. Test d'insertion avec le premier module disponible
DO $$
DECLARE
    first_module_id INTEGER;
    first_module_title VARCHAR(255);
BEGIN
    -- Récupérer le premier module disponible
    SELECT id, title INTO first_module_id, first_module_title
    FROM modules 
    ORDER BY id 
    LIMIT 1;
    
    -- Insérer le token de test
    INSERT INTO access_tokens (
        name,
        description,
        module_id,
        module_name,
        access_level,
        permissions,
        max_usage,
        is_active,
        expires_at
    ) VALUES (
        'Token de test',
        'Token de test pour vérifier l''insertion',
        first_module_id,
        first_module_title,
        'basic',
        ARRAY['access'],
        100,
        true,
        NOW() + INTERVAL '24 hours'
    );
    
    RAISE NOTICE 'Token créé avec module_id: % et module_name: %', first_module_id, first_module_title;
END $$;

-- 10. Vérifier que l'insertion a fonctionné
SELECT 
    'Token de test créé:' as info,
    COUNT(*) as count 
FROM access_tokens 
WHERE name = 'Token de test';

-- 11. Afficher le token créé
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

-- 12. Créer quelques tokens d'exemple avec des modules existants
DO $$
DECLARE
    module_rec RECORD;
    token_count INTEGER := 0;
BEGIN
    FOR module_rec IN SELECT id, title FROM modules ORDER BY id LIMIT 3 LOOP
        token_count := token_count + 1;
        
        INSERT INTO access_tokens (
            name,
            description,
            module_id,
            module_name,
            access_level,
            permissions,
            max_usage,
            is_active,
            expires_at
        ) VALUES (
            'Token ' || module_rec.title || ' Premium',
            'Accès premium à ' || module_rec.title,
            module_rec.id,
            module_rec.title,
            'premium',
            ARRAY['access', 'download'],
            500,
            true,
            NOW() + INTERVAL '7 days'
        );
        
        RAISE NOTICE 'Token créé pour module: % (ID: %)', module_rec.title, module_rec.id;
    END LOOP;
    
    RAISE NOTICE 'Nombre total de tokens créés: %', token_count;
END $$;

-- 13. Afficher tous les tokens
SELECT 
    id,
    name,
    module_name,
    access_level,
    permissions,
    max_usage,
    current_usage,
    is_active,
    created_at,
    expires_at
FROM access_tokens 
ORDER BY created_at DESC;

-- 14. Statistiques finales
SELECT 
    'Statistiques des tokens:' as info,
    COUNT(*) as total_tokens,
    COUNT(*) FILTER (WHERE is_active = true) as tokens_actifs,
    COUNT(*) FILTER (WHERE expires_at < NOW()) as tokens_expires
FROM access_tokens;
