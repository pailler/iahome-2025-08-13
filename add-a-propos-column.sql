-- Script pour ajouter la colonne "a_propos" à la table modules
-- Exécutez ce script dans votre base de données Supabase

-- Ajouter la colonne a_propos si elle n'existe pas
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS a_propos TEXT;

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'modules' 
AND column_name = 'a_propos';

-- Afficher quelques exemples de modules pour vérifier
SELECT id, title, a_propos 
FROM modules 
LIMIT 5; 