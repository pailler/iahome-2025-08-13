-- Script de correction simplifié pour les modules achetés
-- Usage: Exécuter dans Supabase SQL Editor

-- 1. Corriger les politiques RLS sur profiles (supprimer la récursion)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recréer les politiques sans récursion
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Créer la table module_access
CREATE TABLE IF NOT EXISTS module_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES cartes(id) ON DELETE CASCADE,
    access_type TEXT NOT NULL DEFAULT 'purchase',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, module_id)
);

-- 3. Créer les index
CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_module_id ON module_access(module_id);

-- 4. Activer RLS sur module_access
ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;

-- 5. Politiques RLS pour module_access
CREATE POLICY "Users can view own module access" ON module_access
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert module access" ON module_access
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own module access" ON module_access
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. Fonction pour ajouter un accès module
CREATE OR REPLACE FUNCTION add_module_access(
    p_user_email TEXT,
    p_module_id UUID,
    p_access_type TEXT DEFAULT 'purchase',
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_access_id UUID;
BEGIN
    -- Récupérer l'ID utilisateur
    SELECT id INTO v_user_id
    FROM profiles
    WHERE email = p_user_email;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non trouvé: %', p_user_email;
    END IF;
    
    -- Vérifier que le module existe
    IF NOT EXISTS (SELECT 1 FROM cartes WHERE id = p_module_id) THEN
        RAISE EXCEPTION 'Module non trouvé: %', p_module_id;
    END IF;
    
    -- Insérer l'accès
    INSERT INTO module_access (user_id, module_id, access_type, expires_at, metadata)
    VALUES (v_user_id, p_module_id, p_access_type, p_expires_at, p_metadata)
    ON CONFLICT (user_id, module_id)
    DO UPDATE SET
        access_type = EXCLUDED.access_type,
        expires_at = EXCLUDED.expires_at,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    RETURNING id INTO v_access_id;
    
    RETURN v_access_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Vérifier l'état actuel
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'cartes' as table_name, COUNT(*) as row_count FROM cartes
UNION ALL
SELECT 'module_access' as table_name, COUNT(*) as row_count FROM module_access; 