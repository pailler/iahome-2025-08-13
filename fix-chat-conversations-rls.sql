-- Script pour corriger les politiques RLS de la table chat_conversations
-- Exécutez ce script dans votre dashboard Supabase

-- 1. Supprimer les anciennes politiques existantes
DROP POLICY IF EXISTS "Users can view their own chat conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can insert their own chat conversations" ON chat_conversations;

-- 2. Créer de nouvelles politiques plus permissives pour le développement
CREATE POLICY "Enable read access for authenticated users" ON chat_conversations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON chat_conversations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Alternative : Désactiver temporairement RLS pour les tests
-- ALTER TABLE chat_conversations DISABLE ROW LEVEL SECURITY;

-- 4. Vérifier que la table existe et a la bonne structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_conversations'
ORDER BY ordinal_position;

-- 5. Vérifier les politiques actuelles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'chat_conversations'; 