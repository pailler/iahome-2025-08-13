-- Script de test simple pour vérifier l'automatisation
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier que la table module_access existe et est accessible
SELECT '🔍 Test 1: Vérification de la table module_access' as test;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM module_access LIMIT 1) 
        THEN '✅ Table module_access accessible' 
        ELSE '❌ Table module_access non accessible' 
    END as result;

-- 2. Vérifier la structure de la table
SELECT '🔍 Test 2: Structure de la table module_access' as test;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'module_access' 
ORDER BY ordinal_position;

-- 3. Compter les accès existants
SELECT '🔍 Test 3: Nombre d\'accès modules' as test;
SELECT 
    'Total accès' as type,
    COUNT(*) as count
FROM module_access
UNION ALL
SELECT 
    'Accès actifs',
    COUNT(*)
FROM module_access
WHERE is_active = true;

-- 4. Vérifier les modules disponibles
SELECT '🔍 Test 4: Modules disponibles' as test;
SELECT 
    id,
    title,
    category,
    price
FROM modules 
ORDER BY id;

-- 5. Vérifier les utilisateurs
SELECT '🔍 Test 5: Utilisateurs disponibles' as test;
SELECT 
    id,
    email
FROM profiles 
ORDER BY id;

-- 6. Test de création d'un accès manuel (à décommenter si nécessaire)
/*
-- Remplacez USER_ID et MODULE_ID par de vraies valeurs
INSERT INTO module_access (user_id, module_id, access_type, expires_at, is_active, metadata)
VALUES (
    'USER_ID_HERE',  -- Remplacez par un vrai user_id
    MODULE_ID_HERE,  -- Remplacez par un vrai module_id
    'test_manual',
    NOW() + INTERVAL '72 hours',
    true,
    jsonb_build_object('test_manual', true, 'created_at', NOW())
);
*/

-- 7. Instructions pour tester l'automatisation
SELECT '📝 Instructions pour tester l\'automatisation:' as info;
SELECT 
    '1. Vérifiez que la table module_access existe' as step
UNION ALL
SELECT '2. Vérifiez que des accès ont été créés'
UNION ALL
SELECT '3. Allez sur https://iahome.fr/encours'
UNION ALL
SELECT '4. Effectuez un paiement de test avec StableDiffusion'
UNION ALL
SELECT '5. Vérifiez que le module apparaît automatiquement'
UNION ALL
SELECT '6. Si le problème persiste, vérifiez les logs webhook';







