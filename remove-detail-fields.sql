-- Script pour supprimer les champs de détail et à propos de la table modules
-- ATTENTION : Cette opération est irréversible !

-- Vérifier la structure actuelle
SELECT 'Structure actuelle de la table modules' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY column_name;

-- Supprimer les colonnes de détail et à propos
ALTER TABLE modules DROP COLUMN IF EXISTS a_propos;
ALTER TABLE modules DROP COLUMN IF EXISTS detail_title;
ALTER TABLE modules DROP COLUMN IF EXISTS detail_content;
ALTER TABLE modules DROP COLUMN IF EXISTS detail_meta_description;
ALTER TABLE modules DROP COLUMN IF EXISTS detail_slug;
ALTER TABLE modules DROP COLUMN IF EXISTS detail_is_published;

-- Vérifier la structure finale
SELECT 'Structure finale de la table modules' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY column_name;

-- Afficher un exemple de données
SELECT 'Exemple de données après nettoyage' as info;
SELECT id, title, description, category, price, youtube_url, created_at 
FROM modules 
LIMIT 3; 