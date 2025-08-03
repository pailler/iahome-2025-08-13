-- Script pour publier tous les articles de blog en brouillon
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Voir les articles actuels et leur statut
SELECT 
  id,
  title,
  category,
  is_published,
  published_at
FROM blog_articles
ORDER BY created_at DESC;

-- 2. Publier tous les articles en brouillon
UPDATE blog_articles 
SET 
  is_published = true,
  published_at = COALESCE(published_at, NOW())
WHERE is_published = false;

-- 3. Vérifier le résultat
SELECT 
  id,
  title,
  category,
  is_published,
  published_at
FROM blog_articles
ORDER BY created_at DESC; 