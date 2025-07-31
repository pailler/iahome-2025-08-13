# 🔧 Guide de correction - Modules achetés n'apparaissent pas

## 🚨 Problème identifié

Le diagnostic a révélé plusieurs problèmes critiques :

1. **Récursion infinie dans les politiques RLS** sur la table `profiles`
2. **Table `module_access` n'existe pas**
3. **C'est pourquoi les modules achetés n'apparaissent pas dans "mes modules"**

## ✅ Solution

### Étape 1 : Appliquer le script de correction

1. **Allez sur votre dashboard Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Allez dans "SQL Editor"**
4. **Copiez-collez le contenu du fichier `fix-modules-access-complete.sql`**
5. **Cliquez sur "Run"**

### Étape 2 : Vérifier que la correction fonctionne

Après avoir exécuté le script, vous devriez voir :

```sql
-- Résultats attendus :
table_name    | row_count
profiles      | X (nombre d'utilisateurs)
cartes        | Y (nombre de modules)
module_access | 0 (vide au début)
```

### Étape 3 : Tester l'ajout manuel d'un accès

Pour tester que tout fonctionne, vous pouvez ajouter manuellement un accès :

```sql
-- Remplacer par les vraies valeurs de votre base
SELECT add_module_access(
    'formateur_tic@hotmail.com',  -- email utilisateur
    'uuid-du-module',             -- ID du module depuis la table cartes
    'purchase',                   -- type d'accès
    NULL,                         -- pas d'expiration
    '{"test": true}'::jsonb       -- métadonnées
);
```

### Étape 4 : Vérifier l'accès

```sql
-- Vérifier que l'accès a été créé
SELECT 
    ma.id,
    p.email,
    c.title as module_title,
    ma.access_type,
    ma.created_at
FROM module_access ma
JOIN profiles p ON ma.user_id = p.id
JOIN cartes c ON ma.module_id = c.id
WHERE p.email = 'formateur_tic@hotmail.com';
```

## 🔍 Vérification après correction

### 1. Re-tester le diagnostic

```bash
node diagnostic-modules-achat.js
```

Vous devriez maintenant voir :
- ✅ Connexion Supabase : OK
- ✅ Tables de base : OK
- ✅ Accès utilisateur : OK

### 2. Re-tester un paiement

1. **Assurez-vous que le serveur fonctionne** (`npm run dev`)
2. **Effectuez un nouveau paiement** avec votre compte `formateur_tic`
3. **Vérifiez les logs du serveur** pour voir :
   ```
   Webhook reçu: checkout.session.completed
   ✅ Accès module ajouté pour: formateur_tic@hotmail.com
   📧 Email envoyé via Resend: formateur_tic@hotmail.com
   ```

### 3. Vérifier dans l'interface

1. **Connectez-vous** avec `formateur_tic@hotmail.com`
2. **Allez dans "Mes modules"**
3. **Le module acheté devrait maintenant apparaître**

## 🛠️ Fonctions utiles créées

Le script crée deux fonctions utiles :

### `add_module_access(email, module_id, type, expires_at, metadata)`
- Ajoute un accès module pour un utilisateur
- Gère les doublons automatiquement
- Retourne l'ID de l'accès créé

### `check_module_access(email, module_id)`
- Vérifie si un utilisateur a accès à un module
- Prend en compte les expirations
- Retourne `true` ou `false`

## 🔧 En cas de problème

### Si le script échoue :

1. **Vérifiez les permissions** dans Supabase
2. **Assurez-vous d'être connecté** avec un compte admin
3. **Exécutez le script par parties** si nécessaire

### Si les modules n'apparaissent toujours pas :

1. **Vérifiez les logs du serveur** lors d'un paiement
2. **Vérifiez le dashboard Stripe** > Webhooks
3. **Testez l'ajout manuel** d'un accès
4. **Vérifiez les politiques RLS** sur `module_access`

## 📞 Support

Si vous rencontrez des problèmes :

1. **Copiez les erreurs** du script SQL
2. **Copiez les logs** du serveur
3. **Décrivez les étapes** que vous avez suivies

---

**Note** : Cette correction résout le problème de base. Une fois appliquée, les nouveaux achats devraient automatiquement apparaître dans "mes modules" pour tous les utilisateurs. 