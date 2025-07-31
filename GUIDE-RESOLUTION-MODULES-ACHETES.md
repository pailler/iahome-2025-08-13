# 🔧 Guide de résolution - Modules achetés n'apparaissent pas

## 🚨 Problème actuel

Le diagnostic montre que :
- ✅ Table `module_access` existe
- ❌ Récursion infinie sur `profiles` (politiques RLS)
- ❌ Impossible d'accéder aux données utilisateur
- ❌ Modules achetés n'apparaissent pas dans "mes modules"

## ✅ Solution étape par étape

### Étape 1 : Corriger les politiques RLS sur profiles

1. **Allez sur votre dashboard Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Allez dans "SQL Editor"**
4. **Copiez-collez le contenu du fichier `fix-profiles-rls-only.sql`**
5. **Cliquez sur "Run"**

**Résultat attendu** : `profiles_count | X` (nombre d'utilisateurs)

### Étape 2 : Vérifier que la correction fonctionne

Exécutez le diagnostic :
```bash
node diagnostic-modules-achat.js
```

Vous devriez maintenant voir :
- ✅ Connexion Supabase : OK
- ✅ Tables de base : OK
- ✅ Accès utilisateur : OK

### Étape 3 : Identifier les modules et utilisateurs

1. **Allez dans "SQL Editor"**
2. **Copiez-collez le contenu du fichier `test-add-module-access.sql`**
3. **Cliquez sur "Run"**
4. **Notez les résultats** :
   - ID de l'utilisateur `formateur_tic@hotmail.com`
   - ID du module que vous avez acheté

### Étape 4 : Ajouter manuellement l'accès module

Dans "SQL Editor", exécutez (remplacez les UUID par les vraies valeurs) :

```sql
SELECT add_module_access(
    'formateur_tic@hotmail.com',  -- votre email
    'UUID-DU-MODULE-ACHETE',      -- ID du module depuis l'étape 3
    'purchase',                   -- type d'accès
    NULL,                         -- pas d'expiration
    '{"manual": true}'::jsonb     -- métadonnées
);
```

### Étape 5 : Vérifier l'accès

Exécutez à nouveau la requête de vérification :
```sql
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

### Étape 6 : Tester dans l'interface

1. **Connectez-vous** avec `formateur_tic@hotmail.com`
2. **Allez dans "Mes modules"** ou "Accès aux modules"
3. **Le module devrait maintenant apparaître**

## 🔍 Diagnostic du webhook Stripe

Si les modules n'apparaissent toujours pas après l'ajout manuel :

### Vérifier les logs du serveur

1. **Assurez-vous que le serveur fonctionne** (`npm run dev`)
2. **Effectuez un nouveau paiement**
3. **Vérifiez les logs** pour voir :
   ```
   Webhook reçu: checkout.session.completed
   ✅ Accès module ajouté pour: formateur_tic@hotmail.com
   ```

### Vérifier le dashboard Stripe

1. **Allez sur** https://dashboard.stripe.com/webhooks
2. **Cliquez sur le webhook** `we_1Rr4fyLmhaVNwg5P5kYsVLqM`
3. **Vérifiez les tentatives récentes**
4. **Regardez les codes de statut HTTP**

## 🛠️ Correction du webhook

Si le webhook ne fonctionne pas, il faut modifier le code du webhook pour utiliser la fonction `add_module_access`.

### Fichier à modifier : `src/app/api/webhooks/stripe/route.ts`

Ajoutez cette logique dans le traitement de `checkout.session.completed` :

```typescript
// Après avoir traité le paiement
const { data: accessId, error: accessError } = await supabase.rpc('add_module_access', {
  p_user_email: session.customer_email,
  p_module_id: moduleId, // ID du module acheté
  p_access_type: 'purchase',
  p_expires_at: null,
  p_metadata: { stripe_session_id: session.id }
});

if (accessError) {
  console.error('❌ Erreur ajout accès module:', accessError);
} else {
  console.log('✅ Accès module ajouté:', accessId);
}
```

## 📞 En cas de problème

1. **Copiez les erreurs** du script SQL
2. **Copiez les logs** du serveur
3. **Copiez les résultats** des requêtes de diagnostic
4. **Décrivez les étapes** que vous avez suivies

---

**Note** : Cette approche résout le problème de base et permet de tester manuellement. Une fois que l'ajout manuel fonctionne, nous pourrons corriger le webhook Stripe pour automatiser le processus. 