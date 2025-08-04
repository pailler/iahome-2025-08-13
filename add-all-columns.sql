-- Script pour ajouter toutes les colonnes manquantes à la table modules
-- Copiez et exécutez ce script dans votre dashboard Supabase SQL Editor

-- Ajouter la colonne a_propos
ALTER TABLE modules ADD COLUMN IF NOT EXISTS a_propos TEXT;

-- Ajouter les colonnes pour les pages détaillées
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_title TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_content TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_meta_description TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_slug TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS detail_is_published BOOLEAN DEFAULT false;

-- Vérifier que toutes les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'modules' 
AND column_name IN ('a_propos', 'detail_title', 'detail_content', 'detail_meta_description', 'detail_slug', 'detail_is_published')
ORDER BY column_name;

-- Afficher quelques exemples de modules pour vérifier
SELECT id, title, a_propos, detail_title, detail_is_published 
FROM modules 
LIMIT 5; 