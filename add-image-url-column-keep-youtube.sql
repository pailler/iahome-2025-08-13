-- Ajouter la colonne image_url à la table cartes
ALTER TABLE cartes 
ADD COLUMN image_url TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN cartes.image_url IS 'URL de l''image SVG pour l''affichage principal (page d''accueil)';

-- Mettre à jour la carte SDNext avec l'image SVG (garder youtube_url pour la page détaillée)
UPDATE cartes 
SET 
    image_url = '/images/sdnext-interface.svg'
WHERE title ILIKE '%sdnext%';

-- Vérifier la mise à jour
SELECT id, title, image_url, youtube_url 
FROM cartes 
WHERE title ILIKE '%sdnext%'; 