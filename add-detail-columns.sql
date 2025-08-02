-- Script pour ajouter les colonnes detail_* à la table cartes
-- Exécutez ce script dans l'éditeur SQL de Supabase

ALTER TABLE cartes 
ADD COLUMN IF NOT EXISTS detail_title TEXT,
ADD COLUMN IF NOT EXISTS detail_content TEXT,
ADD COLUMN IF NOT EXISTS detail_meta_description TEXT,
ADD COLUMN IF NOT EXISTS detail_slug TEXT,
ADD COLUMN IF NOT EXISTS detail_is_published BOOLEAN DEFAULT false;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cartes' 
AND column_name LIKE 'detail_%'
ORDER BY column_name;