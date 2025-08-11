-- Script de diagnostic complet pour identifier le problème
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table module_access existe
SELECT '🔍 Test 1: Existence de la table module_access' as test;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'module_access')
        THEN '✅ Table module_access existe'
        ELSE '❌ Table module_access n''existe PAS'
    END as result;

-- 2. Si la table existe, vérifier sa structure
SELECT '🔍 Test 2: Structure de module_access (si elle existe)' as test;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'module_access' 
ORDER BY ordinal_position;

-- 3. Vérifier les tables existantes
SELECT '🔍 Test 3: Tables existantes' as test;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%module%' OR table_name LIKE '%access%'
ORDER BY table_name;

-- 4. Vérifier les modules disponibles
SELECT '🔍 Test 4: Modules disponibles' as test;
SELECT 
    id,
    title,
    category,
    price
FROM modules 
ORDER BY id;

-- 5. Vérifier les tokens d'accès existants
SELECT '🔍 Test 5: Tokens d''accès existants' as test;
SELECT 
    id,
    module_id,
    module_name,
    created_by,
    is_active,
    created_at
FROM access_tokens 
WHERE is_active = true
ORDER BY created_at DESC;

-- 6. Vérifier les utilisateurs
SELECT '🔍 Test 6: Utilisateurs disponibles' as test;
SELECT 
    id,
    email
FROM profiles 
ORDER BY id;

-- 7. Test de création de la table module_access (si elle n'existe pas)
SELECT '🔍 Test 7: Tentative de création de module_access' as test;

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS module_access (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    access_type VARCHAR(50) DEFAULT 'purchase',
    token_id VARCHAR(255),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 8. Créer les index
CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_module_id ON module_access(module_id);
CREATE INDEX IF NOT EXISTS idx_module_access_is_active ON module_access(is_active);

-- 9. Créer des accès pour les tokens existants
SELECT '🔍 Test 8: Création d''accès pour les tokens existants' as test;
INSERT INTO module_access (user_id, module_id, access_type, token_id, expires_at, is_active, metadata)
SELECT 
    at.created_by,
    at.module_id,
    'token' as access_type,
    at.id as token_id,
    at.expires_at,
    at.is_active,
    jsonb_build_object('token_id', at.id, 'created_from_token', true) as metadata
FROM access_tokens at
WHERE at.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM module_access ma 
    WHERE ma.user_id = at.created_by 
    AND ma.module_id = at.module_id
    AND ma.is_active = true
);

-- 10. Vérifier le résultat final
SELECT '🔍 Test 9: Résultat final' as test;
SELECT 
    'Accès créés' as type,
    COUNT(*) as count
FROM module_access
UNION ALL
SELECT 
    'Accès actifs',
    COUNT(*)
FROM module_access
WHERE is_active = true;

-- 11. Afficher les accès créés
SELECT '🔍 Test 10: Détail des accès créés' as test;
SELECT 
    ma.id,
    ma.user_id,
    ma.module_id,
    ma.access_type,
    ma.is_active,
    ma.created_at,
    m.title as module_title,
    p.email as user_email
FROM module_access ma
LEFT JOIN modules m ON ma.module_id = m.id
LEFT JOIN profiles p ON ma.user_id = p.id
ORDER BY ma.created_at DESC;







