-- Script pour vérifier la configuration du webhook Stripe
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les variables d'environnement (approximatif)
SELECT '🔧 Configuration webhook Stripe:' as info;
SELECT 
    'URL webhook attendue' as config,
    'https://iahome.fr/api/webhooks/stripe' as value
UNION ALL
SELECT 
    'Événements attendus',
    'checkout.session.completed'
UNION ALL
SELECT 
    'Méthode HTTP',
    'POST';

-- 2. Vérifier les permissions RLS sur toutes les tables
SELECT '🔐 Permissions RLS sur les tables:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('module_access', 'access_tokens', 'modules', 'profiles')
ORDER BY tablename, policyname;

-- 3. Vérifier les contraintes de clés étrangères
SELECT '🔗 Contraintes de clés étrangères:' as info;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('module_access', 'access_tokens')
ORDER BY tc.table_name;

-- 4. Vérifier les index sur les tables importantes
SELECT '📈 Index sur les tables:' as info;
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('module_access', 'access_tokens', 'modules', 'profiles')
ORDER BY tablename, indexname;

-- 5. Test de connexion à toutes les tables
SELECT '✅ Test de connexion aux tables:' as info;
SELECT 
    'module_access' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM module_access LIMIT 1) 
        THEN 'SUCCÈS' 
        ELSE 'ÉCHEC' 
    END as status
UNION ALL
SELECT 
    'access_tokens',
    CASE 
        WHEN EXISTS (SELECT 1 FROM access_tokens LIMIT 1) 
        THEN 'SUCCÈS' 
        ELSE 'ÉCHEC' 
    END
UNION ALL
SELECT 
    'modules',
    CASE 
        WHEN EXISTS (SELECT 1 FROM modules LIMIT 1) 
        THEN 'SUCCÈS' 
        ELSE 'ÉCHEC' 
    END
UNION ALL
SELECT 
    'profiles',
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles LIMIT 1) 
        THEN 'SUCCÈS' 
        ELSE 'ÉCHEC' 
    END;

-- 6. Vérifier les données de test
SELECT '📊 Données de test:' as info;
SELECT 
    'Modules' as type,
    COUNT(*) as count
FROM modules
UNION ALL
SELECT 
    'Tokens actifs',
    COUNT(*)
FROM access_tokens
WHERE is_active = true
UNION ALL
SELECT 
    'Accès modules',
    COUNT(*)
FROM module_access
WHERE is_active = true
UNION ALL
SELECT 
    'Utilisateurs',
    COUNT(*)
FROM profiles;

-- 7. Instructions pour configurer le webhook Stripe
SELECT '📝 Instructions pour configurer le webhook Stripe:' as info;
SELECT 
    '1. Allez dans votre dashboard Stripe' as step
UNION ALL
SELECT '2. Naviguez vers Developers > Webhooks'
UNION ALL
SELECT '3. Cliquez sur "Add endpoint"'
UNION ALL
SELECT '4. URL: https://iahome.fr/api/webhooks/stripe'
UNION ALL
SELECT '5. Événements: checkout.session.completed'
UNION ALL
SELECT '6. Version API: 2025-06-30.basil'
UNION ALL
SELECT '7. Cliquez sur "Add endpoint"'
UNION ALL
SELECT '8. Copiez le webhook secret'
UNION ALL
SELECT '9. Ajoutez-le à vos variables d''environnement';







