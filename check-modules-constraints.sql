-- Vérifier la structure complète de la table modules
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'modules' 
ORDER BY ordinal_position;

-- Vérifier les contraintes de la table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'modules';

-- Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'modules';

-- Vérifier s'il y a une clé primaire
SELECT 
    a.attname,
    format_type(a.atttypid, a.atttypmod) as data_type
FROM   pg_index i
JOIN   pg_attribute a ON a.attrelid = i.indrelid
                    AND a.attnum = ANY(i.indkey)
WHERE  i.indrelid = 'modules'::regclass
AND    i.indisprimary;


















