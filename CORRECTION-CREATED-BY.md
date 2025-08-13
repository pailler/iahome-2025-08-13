# Correction du problème de la colonne `created_by`

## Problème
L'erreur `Could not find the 'created_by' column of 'access_tokens' in the schema cache` indique que Supabase ne reconnaît pas la colonne `created_by` dans la table `access_tokens`.

## Solution

### Étape 1: Exécuter le script SQL de correction

1. **Ouvrez votre interface Supabase Dashboard**
2. **Allez dans la section "SQL Editor"**
3. **Copiez et collez le script suivant :**

```sql
-- Script pour corriger le probleme de la colonne created_by
-- Executez ce script dans Supabase SQL Editor

-- 1. Verifier si la colonne created_by existe
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'access_tokens'
AND column_name = 'created_by';

-- 2. Si la colonne n'existe pas, la creer
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'access_tokens'
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.access_tokens
        ADD COLUMN created_by VARCHAR(255);
        
        RAISE NOTICE 'Colonne created_by ajoutee a la table access_tokens';
    ELSE
        RAISE NOTICE 'La colonne created_by existe deja';
    END IF;
END $$;

-- 3. Forcer la mise a jour des statistiques
ANALYZE public.access_tokens;

-- 4. Verifier la structure finale
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'access_tokens'
ORDER BY ordinal_position;

-- 5. Tester une insertion simple
INSERT INTO public.access_tokens (
    name,
    description,
    module_name,
    access_level,
    permissions,
    max_usage,
    is_active,
    created_by,
    expires_at
) VALUES (
    'Test Created By',
    'Test de la colonne created_by',
    'test-module',
    'basic',
    ARRAY['access'],
    100,
    true,
    'test-user-123',
    NOW() + INTERVAL '1 hour'
) ON CONFLICT (name) DO NOTHING;

-- 6. Verifier l'insertion
SELECT 
    id,
    name,
    created_by,
    created_at
FROM public.access_tokens 
WHERE name = 'Test Created By';

-- 7. Nettoyer le test
DELETE FROM public.access_tokens WHERE name = 'Test Created By';

-- 8. Confirmation
SELECT 'Colonne created_by corrigee avec succes!' as status;
```

4. **Exécutez le script**

### Étape 2: Vérifier que l'application fonctionne

1. **L'application Docker est déjà redémarrée**
2. **Accédez à l'application** : http://localhost:3000
3. **Testez la création d'un token** dans l'interface d'administration

### Étape 3: Si le problème persiste

Si l'erreur persiste après l'exécution du script SQL :

1. **Attendez quelques minutes** (le cache Supabase peut prendre du temps à se mettre à jour)
2. **Redémarrez l'application Docker** :
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## Fichiers créés

- `scripts/fix-created-by-column.sql` - Script SQL de correction
- `scripts/show-fix-script.ps1` - Script PowerShell pour afficher le script
- `CORRECTION-CREATED-BY.md` - Ce fichier de documentation

## Vérification

Après avoir exécuté le script, vous devriez voir :
- La colonne `created_by` dans la structure de la table
- Un message de confirmation "Colonne created_by corrigee avec succes!"
- La possibilité de créer des tokens avec attribution d'utilisateur

## Support

Si le problème persiste, vérifiez :
1. Que vous êtes connecté à la bonne base de données Supabase
2. Que vous avez les permissions d'administrateur
3. Que le cache Supabase a eu le temps de se mettre à jour
