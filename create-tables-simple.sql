-- Script SQL simplifié pour créer les tables d'applications actives
-- Version sans conflits de syntaxe

-- 1. Créer la table active_applications (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS active_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_name VARCHAR(100) NOT NULL,
    module_id BIGINT,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255) NOT NULL,
    access_token TEXT,
    status VARCHAR(50) DEFAULT 'active',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    session_duration INTEGER DEFAULT 0,
    access_count INTEGER DEFAULT 1,
    admin_notes TEXT,
    is_manual_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT
);

-- 2. Créer la table application_access_logs (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS application_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES active_applications(id),
    module_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB
);

-- 3. Ajouter les contraintes (si elles n'existent pas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_status' AND table_name = 'active_applications') THEN
        ALTER TABLE active_applications ADD CONSTRAINT check_status CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_action' AND table_name = 'application_access_logs') THEN
        ALTER TABLE application_access_logs ADD CONSTRAINT check_action CHECK (action IN ('login', 'logout', 'access', 'blocked', 'admin_override'));
    END IF;
END $$;

-- 4. Créer les index (s'ils n'existent pas)
CREATE INDEX IF NOT EXISTS idx_active_apps_user_id ON active_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_active_apps_module_name ON active_applications(module_name);
CREATE INDEX IF NOT EXISTS idx_active_apps_status ON active_applications(status);
CREATE INDEX IF NOT EXISTS idx_active_apps_last_activity ON active_applications(last_activity);

CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON application_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_module_name ON application_access_logs(module_name);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON application_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON application_access_logs(action);

-- 5. Activer RLS
ALTER TABLE active_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_access_logs ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS pour active_applications
DROP POLICY IF EXISTS "Admins can view all active applications" ON active_applications;
CREATE POLICY "Admins can view all active applications" ON active_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all active applications" ON active_applications;
CREATE POLICY "Admins can update all active applications" ON active_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete all active applications" ON active_applications;
CREATE POLICY "Admins can delete all active applications" ON active_applications
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can view their own active applications" ON active_applications;
CREATE POLICY "Users can view their own active applications" ON active_applications
    FOR SELECT USING (user_id = auth.uid());

-- 7. Créer les politiques RLS pour application_access_logs
DROP POLICY IF EXISTS "Admins can view all access logs" ON application_access_logs;
CREATE POLICY "Admins can view all access logs" ON application_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can view their own access logs" ON application_access_logs;
CREATE POLICY "Users can view their own access logs" ON application_access_logs
    FOR SELECT USING (user_id = auth.uid());

-- 8. Créer les fonctions
CREATE OR REPLACE FUNCTION cleanup_expired_applications()
RETURNS void AS $func$
BEGIN
    DELETE FROM active_applications 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$func$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_access_count()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.access_count = OLD.access_count + 1;
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 9. Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_last_activity ON active_applications;
CREATE TRIGGER trigger_update_last_activity
    BEFORE UPDATE ON active_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_access_count();

-- 10. Message de confirmation
SELECT 'Tables d''applications actives créées avec succès!' as message; 