-- Vérification des modules dans la base de données
SELECT 
  id,
  title,
  price,
  category,
  created_at
FROM modules 
ORDER BY id;

-- Recherche spécifique du module Metube
SELECT 
  id,
  title,
  price,
  category,
  created_at
FROM modules 
WHERE title ILIKE '%metube%'
ORDER BY id; 