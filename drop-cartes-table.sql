-- Script pour supprimer définitivement la table cartes
-- ATTENTION : Cette opération est irréversible !

-- Vérifier d'abord que la table modules contient toutes les données
SELECT 'Vérification de la table modules' as info;
SELECT COUNT(*) as nombre_modules FROM modules;

-- Vérifier que la table cartes existe encore
SELECT 'Vérification de la table cartes' as info;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'cartes'
) as table_cartes_existe;

-- Si la table cartes existe, la supprimer
DROP TABLE IF EXISTS cartes CASCADE;

-- Vérifier que la table cartes a bien été supprimée
SELECT 'Vérification après suppression' as info;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'cartes'
) as table_cartes_existe_apres;

-- Afficher les tables restantes
SELECT 'Tables restantes dans le schéma public' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name; 