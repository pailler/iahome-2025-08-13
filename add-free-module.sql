-- Script pour ajouter un module gratuit (prix = 0) pour tester l'affichage "Accès gratuit"
-- Ajouter un module gratuit de test
INSERT INTO modules (title, subtitle, description, category, price, youtube_url) 
VALUES (
  'Module Gratuit Test', 
  'Module de test gratuit', 
  'Ce module est gratuit pour tester l''affichage "Accès gratuit" sur la page d''accueil.', 
  'TEST', 
  '0', 
  'https://www.youtube.com/embed/dQw4w9WgXcQ'
);

-- Vérifier que le module a été ajouté
SELECT 'Module gratuit ajouté' as info;

SELECT 
    id,
    title,
    subtitle,
    description,
    category,
    price,
    youtube_url,
    created_at
FROM modules 
WHERE price = '0'
ORDER BY title;

-- Afficher tous les modules avec leurs prix
SELECT 'Tous les modules avec leurs prix' as info;
SELECT 
    title,
    category,
    price,
    CASE 
        WHEN price = '0' THEN 'GRATUIT'
        ELSE 'PAYANT'
    END as type_acces
FROM modules 
ORDER BY price ASC, title; 