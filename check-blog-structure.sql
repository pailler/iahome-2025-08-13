-- Vérifier la structure de la table blog_articles
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Voir la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'blog_articles'
ORDER BY ordinal_position;

-- 2. Voir les données actuelles
SELECT * FROM blog_articles LIMIT 5; 