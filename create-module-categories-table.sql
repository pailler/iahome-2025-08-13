-- Création de la table module_categories pour supporter les catégories multiples
CREATE TABLE IF NOT EXISTS module_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id BIGINT REFERENCES modules(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, category)
);

-- Création des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_module_categories_module_id ON module_categories(module_id);
CREATE INDEX IF NOT EXISTS idx_module_categories_category ON module_categories(category);

-- Migration des données existantes depuis la table modules
INSERT INTO module_categories (module_id, category)
SELECT id, category 
FROM modules 
WHERE category IS NOT NULL AND category != ''
ON CONFLICT (module_id, category) DO NOTHING;

-- Vérification des données migrées
SELECT 
  m.title,
  array_agg(mc.category) as categories
FROM modules m
LEFT JOIN module_categories mc ON m.id = mc.module_id
GROUP BY m.id, m.title
ORDER BY m.title; 