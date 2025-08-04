-- Script pour recréer la table module_access avec le bon type
-- Supprimer l'ancienne table et créer une nouvelle avec INTEGER pour module_id

-- 1. Supprimer l'ancienne table (si elle existe)
DROP TABLE IF EXISTS module_access;

-- 2. Créer la nouvelle table avec le bon type
CREATE TABLE module_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    module_id INTEGER NOT NULL, -- Changé de UUID à INTEGER
    access_type TEXT NOT NULL DEFAULT 'purchase',
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer un index pour améliorer les performances
CREATE INDEX idx_module_access_user_id ON module_access(user_id);
CREATE INDEX idx_module_access_module_id ON module_access(module_id);
CREATE INDEX idx_module_access_user_module ON module_access(user_id, module_id);

-- 4. Vérifier la structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'module_access' 
ORDER BY ordinal_position;

-- 5. Vérifier que la table est vide
SELECT COUNT(*) as total_access FROM module_access; 