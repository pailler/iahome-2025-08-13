-- Script d'initialisation de la base de données pour IAHome avec Metube

-- Créer la table modules si elle n'existe pas
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'AI Tools',
    price DECIMAL(10,2) DEFAULT 0.00,
    youtube_url TEXT,
    url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table access_tokens si elle n'existe pas
CREATE TABLE IF NOT EXISTS access_tokens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL,
    access_level VARCHAR(50) DEFAULT 'basic',
    permissions TEXT[] DEFAULT ARRAY['access'],
    max_usage INTEGER DEFAULT 1000,
    current_usage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    jwt_token TEXT,
    last_used_at TIMESTAMP,
    usage_log JSONB DEFAULT '[]'::jsonb
);

-- Créer la table user_applications si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_applications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    module_title VARCHAR(255) NOT NULL,
    access_level VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Insérer le module Metube s'il n'existe pas déjà
INSERT INTO modules (title, description, category, price, youtube_url, url) 
VALUES (
    'IA Metube',
    'Application de téléchargement de vidéos YouTube avec interface moderne et fonctionnalités avancées',
    'BUILDING BLOCKS',
    0.00,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    '/api/proxy-metube'
) ON CONFLICT (title) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    youtube_url = EXCLUDED.youtube_url,
    url = EXCLUDED.url,
    updated_at = CURRENT_TIMESTAMP;

-- Créer un token d'accès de test pour Metube
INSERT INTO access_tokens (name, description, module_name, access_level, permissions, max_usage, is_active, expires_at, jwt_token)
SELECT 
    'Token Metube Test',
    'Token de test pour accéder au module Metube',
    'metube',
    'basic',
    ARRAY['access', 'download'],
    1000,
    true,
    NOW() + INTERVAL '24 hours',
    'test_token_' || EXTRACT(EPOCH FROM NOW())::TEXT
WHERE NOT EXISTS (
    SELECT 1 FROM access_tokens WHERE name = 'Token Metube Test'
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_modules_title ON modules(title);
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_access_tokens_module_name ON access_tokens(module_name);
CREATE INDEX IF NOT EXISTS idx_access_tokens_is_active ON access_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_user_applications_user_id ON user_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_applications_module_id ON user_applications(module_id);

-- Vérifier les données insérées
SELECT 'Modules créés:' as info, COUNT(*) as count FROM modules
UNION ALL
SELECT 'Tokens d\'accès créés:', COUNT(*) FROM access_tokens
UNION ALL
SELECT 'Applications utilisateur créées:', COUNT(*) FROM user_applications;

-- Afficher le module Metube
SELECT 'Module Metube:' as info, title, description, category, price, url FROM modules WHERE title ILIKE '%metube%';




