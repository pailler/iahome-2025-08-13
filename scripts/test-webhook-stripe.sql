-- Test du webhook Stripe
-- A executer dans l'editeur SQL de Supabase

-- 1. Verifier les logs de paiement
SELECT 'Logs de paiement:' as info;
SELECT 
    'Pour voir les logs du webhook, allez dans:' as instruction
UNION ALL
SELECT '1. Vercel Dashboard > votre-projet > Functions'
UNION ALL
SELECT '2. Cherchez les logs de /api/webhooks/stripe'
UNION ALL
SELECT '3. Ou dans les logs de votre serveur';

-- 2. Verifier la configuration Stripe
SELECT 'Configuration Stripe requise:' as info;
SELECT 
    '1. STRIPE_SECRET_KEY' as variable
UNION ALL
SELECT '2. STRIPE_WEBHOOK_SECRET'
UNION ALL
SELECT '3. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
UNION ALL
SELECT '4. NEXT_PUBLIC_BASE_URL';

-- 3. Test manuel du webhook
SELECT 'Test manuel du webhook:' as info;
SELECT 
    '1. Allez sur dashboard.stripe.com' as step
UNION ALL
SELECT '2. Webhooks > votre-endpoint'
UNION ALL
SELECT '3. Test webhook > checkout.session.completed'
UNION ALL
SELECT '4. Vérifiez les logs dans Vercel';

-- 4. Verifier les acces existants
SELECT 'Acces modules existants:' as info;
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

-- 5. Instructions pour debug
SELECT 'Debug du webhook:' as info;
SELECT 
    '1. Faites un test de paiement' as step
UNION ALL
SELECT '2. Vérifiez les logs dans Vercel'
UNION ALL
SELECT '3. Cherchez "checkout.session.completed"'
UNION ALL
SELECT '4. Vérifiez si les métadonnées sont présentes'
UNION ALL
SELECT '5. Vérifiez si generate-module-token-webhook est appelé';
