-- Script pour vérifier les données existantes dans la table modules

-- Vérifier la structure de la table
SELECT 'Structure de la table modules' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY ordinal_position;

-- Compter le nombre total de modules
SELECT 'Nombre total de modules' as info;
SELECT COUNT(*) as total_modules FROM modules;

-- Afficher tous les modules avec leurs données
SELECT 'Données complètes des modules' as info;
SELECT 
    id,
    title,
    subtitle,
    description,
    category,
    price,
    youtube_url,
    created_at,
    updated_at
FROM modules 
ORDER BY title;

-- Vérifier les modules avec des sous-titres
SELECT 'Modules avec sous-titres' as info;
SELECT 
    id,
    title,
    subtitle,
    category,
    price
FROM modules 
WHERE subtitle IS NOT NULL AND subtitle != ''
ORDER BY title;

-- Vérifier les modules sans sous-titres
SELECT 'Modules sans sous-titres' as info;
SELECT 
    id,
    title,
    subtitle,
    category,
    price
FROM modules 
WHERE subtitle IS NULL OR subtitle = ''
ORDER BY title; 