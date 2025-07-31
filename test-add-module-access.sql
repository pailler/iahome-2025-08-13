-- Script pour tester l'ajout manuel d'un accès module
-- Usage: Exécuter dans Supabase SQL Editor après avoir corrigé les politiques RLS

-- 1. Vérifier les utilisateurs existants
SELECT id, email, created_at FROM profiles ORDER BY created_at DESC LIMIT 5;

-- 2. Vérifier les modules disponibles
SELECT id, title, price FROM cartes ORDER BY created_at DESC LIMIT 5;

-- 3. Ajouter un accès module manuellement (remplacer les UUID par les vraies valeurs)
-- Exemple (à adapter avec les vraies valeurs de votre base) :
/*
SELECT add_module_access(
    'formateur_tic@hotmail.com',  -- email utilisateur
    'uuid-du-module-depuis-cartes', -- ID du module depuis la table cartes
    'purchase',                   -- type d'accès
    NULL,                         -- pas d'expiration
    '{"test": true, "manual": true}'::jsonb -- métadonnées
);
*/

-- 4. Vérifier les accès existants
SELECT 
    ma.id,
    p.email,
    c.title as module_title,
    ma.access_type,
    ma.created_at
FROM module_access ma
JOIN profiles p ON ma.user_id = p.id
JOIN cartes c ON ma.module_id = c.id
ORDER BY ma.created_at DESC; 