-- Script pour supprimer la table cartes après migration vers modules
-- ATTENTION : Cette action est irréversible !

-- 1. Vérifier que tous les modules sont bien dans la table modules
SELECT 
    COUNT(*) as total_modules,
    COUNT(DISTINCT title) as modules_uniques
FROM modules;

-- 2. Vérifier qu'il n'y a plus de données importantes dans cartes
SELECT 
    COUNT(*) as total_cartes
FROM cartes;

-- 3. Supprimer la table cartes (décommentez la ligne suivante après vérification)
-- DROP TABLE IF EXISTS cartes CASCADE;

-- 4. Vérifier que la table a bien été supprimée
-- SELECT COUNT(*) FROM cartes; -- Doit retourner une erreur si la table n'existe plus 