-- Script pour ajouter la colonne subtitle à la table modules
-- ATTENTION : Cette opération est réversible !

-- Vérifier la structure actuelle
SELECT 'Structure actuelle de la table modules' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY column_name;

-- Ajouter la colonne subtitle
ALTER TABLE modules ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Vérifier la structure finale
SELECT 'Structure finale de la table modules' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY column_name;

-- Afficher un exemple de données
SELECT 'Exemple de données après ajout' as info;
SELECT id, title, subtitle, description, category, price, youtube_url, created_at 
FROM modules 
LIMIT 3; 