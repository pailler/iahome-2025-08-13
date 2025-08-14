-- Script pour ajouter le module PDF+ à la base de données
-- Ce script ajoute le module PDF+ avec l'icône SVG appropriée

-- 1. Vérifier si le module PDF+ existe déjà
SELECT 
    id,
    title,
    description,
    category,
    price,
    image_url
FROM modules 
WHERE title ILIKE '%pdf%' OR title ILIKE '%PDF+%';

-- 2. Ajouter le module PDF+ s'il n'existe pas
INSERT INTO modules (title, description, category, price, image_url, url) 
VALUES (
    'PDF+',
    'Outil avancé de gestion et manipulation de fichiers PDF avec fonctionnalités d\'édition, conversion et analyse',
    'WEB TOOLS',
    0.00,
    '/images/pdf-icon.svg',
    '/api/proxy-pdf'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- 3. Vérifier le résultat
SELECT 
    id,
    title,
    description,
    category,
    price,
    image_url,
    CASE 
        WHEN price = 0.00 THEN 'Free'
        ELSE CONCAT(price::text, ' €')
    END as display_price
FROM modules
WHERE title ILIKE '%pdf%' OR title ILIKE '%PDF+%'
ORDER BY title;

-- 4. Afficher tous les modules pour vérification
SELECT 
    id,
    title,
    category,
    price,
    image_url,
    CASE 
        WHEN price = 0.00 THEN 'Free'
        ELSE CONCAT(price::text, ' €')
    END as display_price
FROM modules
ORDER BY title;
