-- Script pour configurer les politiques RLS sur la table cartes
-- Exécutez ce script dans l'éditeur SQL de votre dashboard Supabase

-- 1. Activer RLS sur la table cartes (si pas déjà fait)
ALTER TABLE cartes ENABLE ROW LEVEL SECURITY;

-- 2. Créer une politique pour permettre la lecture de toutes les cartes
CREATE POLICY "Enable read access for all users" ON cartes
FOR SELECT USING (true);

-- 3. Créer une politique pour permettre l'insertion de cartes
CREATE POLICY "Enable insert for all users" ON cartes
FOR INSERT WITH CHECK (true);

-- 4. Créer une politique pour permettre la mise à jour de cartes
CREATE POLICY "Enable update for all users" ON cartes
FOR UPDATE USING (true);

-- 5. Créer une politique pour permettre la suppression de cartes
CREATE POLICY "Enable delete for all users" ON cartes
FOR DELETE USING (true);

-- Vérifier les politiques existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'cartes';