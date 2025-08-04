-- Script pour identifier et nettoyer les modules en double
-- Exécuter ces requêtes dans l'interface SQL de Supabase

-- 1. Identifier les modules en double
SELECT 
    title,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ' ORDER BY created_at DESC) as ids,
    STRING_AGG(created_at::text, ', ' ORDER BY created_at DESC) as created_dates
FROM modules 
GROUP BY title 
HAVING COUNT(*) > 1
ORDER BY count DESC, title;

-- 2. Voir les détails des modules "Stable diffusion" en double
SELECT 
    id,
    title,
    price,
    category,
    created_at,
    updated_at
FROM modules 
WHERE title = 'Stable diffusion'
ORDER BY created_at DESC;

-- 3. Supprimer les doublons (garder le plus récent)
-- ATTENTION: Exécuter seulement après avoir vérifié les résultats ci-dessus

-- Pour "Stable diffusion" spécifiquement
DELETE FROM modules 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
        FROM modules 
        WHERE title = 'Stable diffusion'
    ) ranked
    WHERE rn > 1
);

-- 4. Vérifier qu'il ne reste qu'un seul module "Stable diffusion"
SELECT 
    id,
    title,
    price,
    category,
    created_at
FROM modules 
WHERE title = 'Stable diffusion'
ORDER BY created_at DESC;

-- 5. Vérifier qu'il n'y a plus de doublons
SELECT 
    title,
    COUNT(*) as count
FROM modules 
GROUP BY title 
HAVING COUNT(*) > 1
ORDER BY count DESC, title; 