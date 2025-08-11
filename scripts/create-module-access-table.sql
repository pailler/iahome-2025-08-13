-- Script pour créer la table module_access manquante
-- Cette table est utilisée par le code mais n'existe pas dans le script d'initialisation

-- Créer la table module_access si elle n'existe pas
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

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_module_id ON module_access(module_id);
CREATE INDEX IF NOT EXISTS idx_module_access_is_active ON module_access(is_active);
CREATE INDEX IF NOT EXISTS idx_module_access_expires_at ON module_access(expires_at);

-- Créer une contrainte unique pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_module_access_unique_user_module 
ON module_access(user_id, module_id) 
WHERE is_active = true;

-- Vérifier que la table a été créée
SELECT 'Table module_access créée avec succès' as status;

-- Afficher la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'module_access' 
ORDER BY ordinal_position;








