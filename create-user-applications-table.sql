-- Création de la table user_applications pour gérer les applications activées par chaque utilisateur
CREATE TABLE IF NOT EXISTS user_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL DEFAULT 'basic' CHECK (access_level IN ('basic', 'premium', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON user_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_module_id ON user_applications(module_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_active ON user_applications(is_active);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_applications_updated_at 
    BEFORE UPDATE ON user_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour la sécurité
ALTER TABLE user_applications ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres applications
CREATE POLICY "Users can view their own applications" ON user_applications
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux admins de voir toutes les applications
CREATE POLICY "Admins can view all applications" ON user_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux utilisateurs de modifier leurs propres applications
CREATE POLICY "Users can update their own applications" ON user_applications
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux admins de modifier toutes les applications
CREATE POLICY "Admins can update all applications" ON user_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux admins d'insérer des applications
CREATE POLICY "Admins can insert applications" ON user_applications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux admins de supprimer des applications
CREATE POLICY "Admins can delete applications" ON user_applications
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Fonction pour obtenir les applications d'un utilisateur avec les détails du module
CREATE OR REPLACE FUNCTION get_user_applications_with_modules(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    module_id BIGINT,
    module_title TEXT,
    module_description TEXT,
    access_level TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id,
        ua.user_id,
        ua.module_id,
        m.title as module_title,
        m.description as module_description,
        ua.access_level,
        ua.is_active,
        ua.created_at,
        ua.expires_at
    FROM user_applications ua
    JOIN modules m ON ua.module_id = m.id
    WHERE ua.user_id = user_uuid
    ORDER BY ua.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour activer/désactiver une application
CREATE OR REPLACE FUNCTION toggle_user_application(app_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_status BOOLEAN;
BEGIN
    -- Vérifier que l'utilisateur est admin ou propriétaire de l'application
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.id = user_uuid)
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Récupérer le statut actuel
    SELECT is_active INTO current_status
    FROM user_applications
    WHERE id = app_uuid AND user_id = user_uuid;
    
    -- Basculer le statut
    UPDATE user_applications
    SET is_active = NOT current_status
    WHERE id = app_uuid AND user_id = user_uuid;
    
    RETURN NOT current_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour la documentation
COMMENT ON TABLE user_applications IS 'Table pour gérer les applications activées par chaque utilisateur';
COMMENT ON COLUMN user_applications.user_id IS 'ID de l''utilisateur qui a accès à l''application';
COMMENT ON COLUMN user_applications.module_id IS 'ID du module auquel l''utilisateur a accès';
COMMENT ON COLUMN user_applications.access_level IS 'Niveau d''accès: basic, premium, ou admin';
COMMENT ON COLUMN user_applications.is_active IS 'Indique si l''accès est actuellement actif';
COMMENT ON COLUMN user_applications.expires_at IS 'Date d''expiration de l''accès (optionnel)'; 