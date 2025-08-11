-- Script de correction rapide pour l'automatisation des modules
-- À exécuter IMMÉDIATEMENT dans l'éditeur SQL de Supabase

-- 1. Créer la table module_access
CREATE TABLE IF NOT EXISTS module_access (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    access_type VARCHAR(50) DEFAULT 'purchase',
    token_id VARCHAR(255),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Créer les index essentiels
CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_module_id ON module_access(module_id);
CREATE INDEX IF NOT EXISTS idx_module_access_is_active ON module_access(is_active);

-- 3. Créer des accès pour tous les tokens existants
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

-- 4. Vérifier le résultat
SELECT '✅ Table module_access créée avec succès' as status;
SELECT COUNT(*) as "Nombre d'accès créés" FROM module_access;







