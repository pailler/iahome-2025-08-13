-- Verification de la configuration webhook Stripe
-- A executer dans l'editeur SQL de Supabase

-- 1. Verifier les RLS policies sur module_access
SELECT 'RLS Policies sur module_access:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'module_access';

-- 2. Verifier les RLS policies sur access_tokens
SELECT 'RLS Policies sur access_tokens:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'access_tokens';

-- 3. Verifier les foreign keys
SELECT 'Foreign Keys:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'module_access' OR tc.table_name = 'access_tokens');

-- 4. Verifier les index
SELECT 'Index sur module_access:' as info;
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'module_access';

-- 5. Instructions pour Stripe
SELECT 'Configuration Stripe requise:' as info;
SELECT 
    '1. Allez sur dashboard.stripe.com' as step
UNION ALL
SELECT '2. Webhooks > Add endpoint'
UNION ALL
SELECT '3. URL: https://iahome.fr/api/webhooks/stripe'
UNION ALL
SELECT '4. Events: checkout.session.completed'
UNION ALL
SELECT '5. Copiez le webhook secret'
UNION ALL
SELECT '6. Ajoutez-le dans vos variables d''environnement';







