-- Création de la table module_access_sessions pour gérer les sessions d'accès temporaires
CREATE TABLE IF NOT EXISTS module_access_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_module_access_sessions_user_module ON module_access_sessions(user_id, module_name);
CREATE INDEX IF NOT EXISTS idx_module_access_sessions_status_expires ON module_access_sessions(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_module_access_sessions_token ON module_access_sessions(session_token);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_module_access_sessions_updated_at 
    BEFORE UPDATE ON module_access_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS (Row Level Security)
ALTER TABLE module_access_sessions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres sessions
CREATE POLICY "Users can view their own sessions" ON module_access_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres sessions
CREATE POLICY "Users can create their own sessions" ON module_access_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres sessions
CREATE POLICY "Users can update their own sessions" ON module_access_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux admins de voir toutes les sessions
CREATE POLICY "Admins can view all sessions" ON module_access_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Commentaires sur la table
COMMENT ON TABLE module_access_sessions IS 'Table pour gérer les sessions d''accès temporaires aux modules avec limitation de temps';
COMMENT ON COLUMN module_access_sessions.user_id IS 'ID de l''utilisateur';
COMMENT ON COLUMN module_access_sessions.module_name IS 'Nom du module accédé';
COMMENT ON COLUMN module_access_sessions.session_token IS 'Token de session sécurisé';
COMMENT ON COLUMN module_access_sessions.expires_at IS 'Date d''expiration de la session';
COMMENT ON COLUMN module_access_sessions.status IS 'Statut de la session (active, expired, revoked)'; 