-- Création de la table pour les logs d'accès aux modules
CREATE TABLE IF NOT EXISTS module_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    access_token TEXT NOT NULL, -- Stocke seulement le début du token pour l'audit
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_module_access_logs_user_id ON module_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_logs_module_name ON module_access_logs(module_name);
CREATE INDEX IF NOT EXISTS idx_module_access_logs_created_at ON module_access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_module_access_logs_status ON module_access_logs(status);

-- Politique RLS (Row Level Security) pour la sécurité
ALTER TABLE module_access_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres logs
CREATE POLICY "Users can view their own access logs" ON module_access_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion de nouveaux logs
CREATE POLICY "System can insert access logs" ON module_access_logs
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre aux admins de voir tous les logs
CREATE POLICY "Admins can view all access logs" ON module_access_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Fonction pour nettoyer automatiquement les logs expirés (optionnel)
CREATE OR REPLACE FUNCTION cleanup_expired_access_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM module_access_logs 
    WHERE expires_at < NOW() 
    AND status = 'expired';
END;
$$ LANGUAGE plpgsql;

-- Trigger pour marquer automatiquement les tokens expirés
CREATE OR REPLACE FUNCTION mark_expired_tokens()
RETURNS trigger AS $$
BEGIN
    UPDATE module_access_logs 
    SET status = 'expired' 
    WHERE expires_at < NOW() 
    AND status = 'active';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger (optionnel - peut être exécuté périodiquement)
-- CREATE TRIGGER trigger_mark_expired_tokens
--     AFTER INSERT ON module_access_logs
--     FOR EACH ROW
--     EXECUTE FUNCTION mark_expired_tokens();

-- Vue pour les statistiques d'accès (optionnel)
CREATE OR REPLACE VIEW module_access_stats AS
SELECT 
    module_name,
    COUNT(*) as total_accesses,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tokens,
    COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_tokens,
    MIN(created_at) as first_access,
    MAX(created_at) as last_access
FROM module_access_logs
GROUP BY module_name;

-- Commentaires pour la documentation
COMMENT ON TABLE module_access_logs IS 'Table pour tracer les accès aux modules avec tokens d''authentification';
COMMENT ON COLUMN module_access_logs.access_token IS 'Début du token d''accès (pour audit, pas le token complet)';
COMMENT ON COLUMN module_access_logs.metadata IS 'Données supplémentaires en JSON (IP, géolocalisation, etc.)'; 