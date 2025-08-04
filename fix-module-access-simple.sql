-- Script simple pour corriger la table module_access
-- Modifier le type de la colonne module_id pour accepter des entiers

-- 1. Vérifier la structure actuelle
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'module_access' 
AND column_name = 'module_id';

-- 2. Modifier le type de la colonne module_id
ALTER TABLE module_access 
ALTER COLUMN module_id TYPE INTEGER USING module_id::INTEGER;

-- 3. Vérifier la modification
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'module_access' 
AND column_name = 'module_id';

-- 4. Vérifier les données existantes
SELECT COUNT(*) as total_access FROM module_access; 