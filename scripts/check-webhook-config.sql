-- Script pour vérifier la configuration des webhooks
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les variables d'environnement (approximatif)
SELECT '🔧 Configuration webhook:' as info;
SELECT 
    'URL webhook attendue' as config,
    'https://iahome.fr/api/webhooks/stripe' as value
UNION ALL
SELECT 
    'Événements attendus',
    'checkout.session.completed, payment_intent.succeeded'
UNION ALL
SELECT 
    'Méthode HTTP',
    'POST';

-- 2. Vérifier les permissions RLS sur module_access
SELECT '🔐 Permissions RLS:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'module_access';

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
AND tc.table_name = 'module_access';

-- 4. Vérifier les index sur module_access
SELECT '📈 Index sur module_access:' as info;
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'module_access';

-- 5. Test de connexion à la table module_access
SELECT '✅ Test de connexion module_access:' as info;
SELECT 
    'Table accessible' as test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM module_access LIMIT 1) 
        THEN 'SUCCÈS' 
        ELSE 'ÉCHEC' 
    END as result;







