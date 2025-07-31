-- Ajouter une URL YouTube fictive pour la carte SDNext
-- Cette vidéo est une démonstration de Stable Diffusion WebUI

UPDATE cartes 
SET 
    youtube_url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
WHERE title ILIKE '%sdnext%';

-- Vérifier la mise à jour
SELECT id, title, youtube_url, image_url 
FROM cartes 
WHERE title ILIKE '%sdnext%'; 