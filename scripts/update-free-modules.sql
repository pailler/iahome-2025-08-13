-- Script pour mettre à jour les modules gratuits
-- Met tous les modules avec un prix de 0.00 pour afficher "Free"

-- 1. Afficher les modules actuels avec leurs prix
SELECT 
    id,
    title,
    price,
    category
FROM modules
ORDER BY price DESC, title;

-- 2. Mettre à jour tous les modules pour avoir un prix de 0
UPDATE modules 
SET price = 0.00 
WHERE price > 0.00;

-- 3. Vérifier le résultat
SELECT 
    id,
    title,
    price,
    category,
    CASE 
        WHEN price = 0.00 THEN 'Free'
        ELSE CONCAT(price::text, ' €')
    END as display_price
FROM modules
ORDER BY title;

-- 4. Compter les modules par prix
SELECT 
    price,
    COUNT(*) as count,
    CASE 
        WHEN price = 0.00 THEN 'Free'
        ELSE CONCAT(price::text, ' €')
    END as display_price
FROM modules
GROUP BY price
ORDER BY price;
