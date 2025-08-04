-- Script pour désactiver temporairement RLS sur la table modules
-- ATTENTION : Ce script désactive la sécurité - À utiliser uniquement pour les tests !

-- 1. Vérifier l'état actuel
SELECT 'État actuel de RLS sur la table modules' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modules';

-- 2. Désactiver RLS temporairement
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier que RLS est désactivé
SELECT 'État après désactivation de RLS' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modules';

-- 4. Test d'accès sans authentification
SELECT 'Test d\'accès sans authentification' as info;
SELECT COUNT(*) as nombre_modules_accessibles FROM modules;

-- 5. Afficher quelques modules pour vérifier l'accès
SELECT 'Exemple de modules accessibles' as info;
SELECT 
    id,
    title,
    subtitle,
    category,
    price
FROM modules 
ORDER BY title 
LIMIT 3;

-- ⚠️ RAPPEL : Réactiver RLS après les tests avec le script suivant :
-- ALTER TABLE modules ENABLE ROW LEVEL SECURITY; 