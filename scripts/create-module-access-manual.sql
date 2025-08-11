-- Script SQL pour créer la table module_access manquante
-- À exécuter dans l'interface SQL de Supabase

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

-- 2. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_module_id ON module_access(module_id);
CREATE INDEX IF NOT EXISTS idx_module_access_is_active ON module_access(is_active);
CREATE INDEX IF NOT EXISTS idx_module_access_expires_at ON module_access(expires_at);

-- 3. Créer une contrainte unique pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_module_access_unique_user_module 
ON module_access(user_id, module_id) 
WHERE is_active = true;

-- 4. Créer des accès modules pour les tokens existants
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

-- 5. Vérifier les résultats
SELECT 'Table module_access créée avec succès' as status;

-- 6. Afficher les statistiques
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








