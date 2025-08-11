-- Vérifier la structure exacte de la table modules
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'modules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les contraintes de la table modules
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'modules'::regclass;

-- Vérifier les modules existants avec toutes les colonnes disponibles
SELECT * FROM modules LIMIT 5;

-- Vérifier s'il y a des modules avec 'metube' dans le titre
SELECT * FROM modules 
WHERE title ILIKE '%metube%' OR title ILIKE '%tube%'
ORDER BY title;
