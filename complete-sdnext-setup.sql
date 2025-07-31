-- Script complet pour configurer SDNext avec image SVG + vidéo YouTube
-- À exécuter dans l'interface SQL de Supabase

-- 1. Ajouter la colonne image_url si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cartes' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE cartes ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Colonne image_url ajoutée';
    ELSE
        RAISE NOTICE 'Colonne image_url existe déjà';
    END IF;
END $$;

-- 2. Mettre à jour la carte SDNext avec image SVG + URL YouTube
UPDATE cartes 
SET 
    image_url = '/images/sdnext-interface.svg',
    youtube_url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
WHERE title ILIKE '%sdnext%';

-- 3. Vérifier le résultat
SELECT 
    id,
    title,
    image_url,
    youtube_url,
    CASE 
        WHEN image_url IS NOT NULL AND youtube_url IS NOT NULL 
        THEN '✅ Configuré avec image + vidéo'
        WHEN image_url IS NOT NULL 
        THEN '⚠️  Image seulement'
        WHEN youtube_url IS NOT NULL 
        THEN '⚠️  Vidéo seulement'
        ELSE '❌ Aucun média'
    END as status
FROM cartes 
WHERE title ILIKE '%sdnext%'; 