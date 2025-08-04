-- Script pour ajouter des données de test dans la table modules
-- ATTENTION : Ce script ajoute des données de test !

-- Vérifier d'abord s'il y a déjà des données
SELECT 'Vérification des données existantes' as info;
SELECT COUNT(*) as modules_existants FROM modules;

-- Ajouter des modules de test si la table est vide
INSERT INTO modules (title, subtitle, description, category, price, youtube_url) 
SELECT * FROM (VALUES 
  ('Canvas Building Framework', 'Framework de construction avec IA', 'Un framework puissant pour construire des applications avec l''intelligence artificielle. Intégration native avec les outils IA les plus populaires.', 'BUILDING BLOCKS', 29.99, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('IA Photo Editor', 'Éditeur photo intelligent', 'Éditeur de photos alimenté par l''IA pour retoucher, améliorer et transformer vos images automatiquement.', 'IA PHOTO', 19.99, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('IA Video Generator', 'Générateur de vidéos IA', 'Créez des vidéos professionnelles en quelques clics grâce à l''intelligence artificielle.', 'IA VIDEO', 39.99, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('IA Marketing Assistant', 'Assistant marketing intelligent', 'Optimisez vos campagnes marketing avec l''aide de l''IA. Analyse, recommandations et automatisation.', 'IA MARKETING', 24.99, 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('IA Design Tools', 'Outils de design IA', 'Suite complète d''outils de design alimentés par l''IA pour créer des visuels professionnels.', 'IA DESIGN', 34.99, 'https://www.youtube.com/embed/dQw4w9WgXcQ')
) AS new_modules(title, subtitle, description, category, price, youtube_url)
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE modules.title = new_modules.title);

-- Vérifier les données après insertion
SELECT 'Données après insertion' as info;
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
ORDER BY title;

-- Afficher un résumé
SELECT 'Résumé final' as info;
SELECT 
    COUNT(*) as total_modules,
    COUNT(CASE WHEN subtitle IS NOT NULL AND subtitle != '' THEN 1 END) as modules_avec_sous_titre,
    COUNT(CASE WHEN subtitle IS NULL OR subtitle = '' THEN 1 END) as modules_sans_sous_titre
FROM modules; 