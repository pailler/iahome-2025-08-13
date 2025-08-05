-- Script pour supprimer les éléments de menu de test "Éditeur HTML"

-- Supprimer tous les éléments de menu contenant "Test" et "Éditeur" dans le titre
DELETE FROM menu_items 
WHERE title ILIKE '%test%' 
   OR title ILIKE '%éditeur%' 
   OR title ILIKE '%html%'
   OR title ILIKE '%final%';

-- Supprimer spécifiquement les éléments de test connus
DELETE FROM menu_items 
WHERE title IN (
    'Test Éditeur HTML',
    'Test Éditeur HTML Final',
    'Test Éditeur',
    'Éditeur HTML',
    'Test HTML'
);

-- Afficher les éléments restants pour vérification
SELECT id, title, url, position, is_active 
FROM menu_items 
ORDER BY position;

-- Afficher le nombre d'éléments supprimés
SELECT 'Éléments de menu de test supprimés avec succès' as message; 