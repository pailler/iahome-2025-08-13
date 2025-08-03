-- Ajouter la colonne is_published à la table blog_articles
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne is_published
ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- 2. Ajouter la colonne published_at si elle n'existe pas
ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- 3. Mettre à jour tous les articles existants comme publiés
UPDATE blog_articles 
SET 
  is_published = true,
  published_at = COALESCE(published_at, created_at)
WHERE is_published IS NULL OR is_published = false;

-- 4. Vérifier le résultat
SELECT 
  id,
  title,
  category,
  is_published,
  published_at,
  created_at
FROM blog_articles
ORDER BY created_at DESC; 