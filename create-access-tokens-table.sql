-- Création de la table access_tokens pour la gestion complète des tokens
CREATE TABLE IF NOT EXISTS access_tokens (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    access_level TEXT NOT NULL DEFAULT 'premium' CHECK (access_level IN ('basic', 'premium', 'admin')),
    permissions TEXT[] NOT NULL DEFAULT ARRAY['read', 'access'],
    max_usage INTEGER,
    current_usage INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    jwt_token TEXT NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_log JSONB DEFAULT '[]'::jsonb
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_access_tokens_module_id ON access_tokens(module_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_created_by ON access_tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_access_tokens_is_active ON access_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_access_tokens_expires_at ON access_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_access_tokens_created_at ON access_tokens(created_at);

-- RLS (Row Level Security) pour sécuriser l'accès
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de voir tous les tokens
CREATE POLICY "Admins can view all tokens" ON access_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux admins de créer des tokens
CREATE POLICY "Admins can create tokens" ON access_tokens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux admins de modifier des tokens
CREATE POLICY "Admins can update tokens" ON access_tokens
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux admins de supprimer des tokens
CREATE POLICY "Admins can delete tokens" ON access_tokens
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Fonction pour incrémenter l'usage d'un token
CREATE OR REPLACE FUNCTION increment_token_usage(token_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    token_record RECORD;
BEGIN
    -- Récupérer le token
    SELECT * INTO token_record 
    FROM access_tokens 
    WHERE id = token_id AND is_active = true;
    
    -- Vérifier si le token existe et n'est pas expiré
    IF token_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    IF token_record.expires_at < NOW() THEN
        RETURN FALSE;
    END IF;
    
    -- Vérifier la limite d'usage
    IF token_record.max_usage IS NOT NULL AND token_record.current_usage >= token_record.max_usage THEN
        RETURN FALSE;
    END IF;
    
    -- Incrémenter l'usage
    UPDATE access_tokens 
    SET 
        current_usage = current_usage + 1,
        last_used_at = NOW(),
        usage_log = usage_log || jsonb_build_object(
            'timestamp', NOW(),
            'action', 'access',
            'ip', inet_client_addr()
        )
    WHERE id = token_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour valider un token JWT
CREATE OR REPLACE FUNCTION validate_access_token(jwt_token TEXT)
RETURNS JSONB AS $$
DECLARE
    token_record RECORD;
    result JSONB;
BEGIN
    -- Récupérer le token depuis la base de données
    SELECT * INTO token_record 
    FROM access_tokens 
    WHERE jwt_token = jwt_token AND is_active = true;
    
    -- Vérifier si le token existe
    IF token_record IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token not found');
    END IF;
    
    -- Vérifier l'expiration
    IF token_record.expires_at < NOW() THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token expired');
    END IF;
    
    -- Vérifier la limite d'usage
    IF token_record.max_usage IS NOT NULL AND token_record.current_usage >= token_record.max_usage THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Usage limit reached');
    END IF;
    
    -- Token valide
    result = jsonb_build_object(
        'valid', true,
        'tokenId', token_record.id,
        'name', token_record.name,
        'moduleId', token_record.module_id,
        'moduleName', token_record.module_name,
        'accessLevel', token_record.access_level,
        'permissions', token_record.permissions,
        'currentUsage', token_record.current_usage,
        'maxUsage', token_record.max_usage,
        'expiresAt', token_record.expires_at
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour documenter la table
COMMENT ON TABLE access_tokens IS 'Table pour stocker les tokens d''accès aux modules avec paramètres personnalisables';
COMMENT ON COLUMN access_tokens.id IS 'Identifiant unique du token';
COMMENT ON COLUMN access_tokens.name IS 'Nom descriptif du token';
COMMENT ON COLUMN access_tokens.description IS 'Description détaillée du token';
COMMENT ON COLUMN access_tokens.module_id IS 'ID du module associé';
COMMENT ON COLUMN access_tokens.module_name IS 'Nom du module associé';
COMMENT ON COLUMN access_tokens.access_level IS 'Niveau d''accès: basic, premium, admin';
COMMENT ON COLUMN access_tokens.permissions IS 'Liste des permissions accordées';
COMMENT ON COLUMN access_tokens.max_usage IS 'Nombre maximum d''utilisations (NULL = illimité)';
COMMENT ON COLUMN access_tokens.current_usage IS 'Nombre d''utilisations actuelles';
COMMENT ON COLUMN access_tokens.is_active IS 'Statut actif/inactif du token';
COMMENT ON COLUMN access_tokens.created_by IS 'ID de l''utilisateur qui a créé le token';
COMMENT ON COLUMN access_tokens.created_at IS 'Date de création du token';
COMMENT ON COLUMN access_tokens.expires_at IS 'Date d''expiration du token';
COMMENT ON COLUMN access_tokens.jwt_token IS 'Token JWT généré';
COMMENT ON COLUMN access_tokens.last_used_at IS 'Dernière utilisation du token';
COMMENT ON COLUMN access_tokens.usage_log IS 'Journal des utilisations du token'; 