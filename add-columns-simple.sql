-- Script simple pour ajouter les colonnes manquantes
ALTER TABLE modules ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS a_propos TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_title TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_content TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_meta_description TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_slug TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_is_published BOOLEAN DEFAULT false;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY column_name; 