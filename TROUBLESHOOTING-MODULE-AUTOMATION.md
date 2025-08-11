# Guide de Dépannage - Automatisation des Modules

## 🚨 Problème : Module ne s'ajoute pas automatiquement après paiement

### Symptômes
- Paiement réussi mais module n'apparaît pas dans `/encours`
- Webhook Stripe reçu mais pas d'accès créé
- Erreur "Table module_access non accessible"

### 🔍 Diagnostic

#### 1. Vérifier la structure de la base de données

**Problème identifié :** La table `module_access` n'existe pas dans le script d'initialisation mais est utilisée par le code.

**Solution :** Exécuter le script de correction :

```powershell
# Dans le dossier scripts/
.\fix-module-automation.ps1
```

#### 2. Vérifier les logs webhook

```bash
# Vérifier les logs Stripe
tail -f logs/traefik/access.log | grep webhook

# Vérifier les logs d'erreur
tail -f logs/nginx/error.log
```

#### 3. Tester l'API webhook manuellement

```bash
curl -X POST http://localhost:3000/api/generate-module-token-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "moduleId": "1",
    "userId": "test-user-id",
    "paymentId": "test-payment",
    "accessLevel": "premium",
    "expirationHours": 72,
    "maxUsage": 100
  }'
```

### 🔧 Solutions

#### Solution 1 : Créer la table module_access manquante

1. **Exécuter le script automatique :**
   ```powershell
   cd scripts
   .\fix-module-automation.ps1
   ```

2. **Ou exécuter manuellement dans Supabase :**
   ```sql
   -- Créer la table module_access
   CREATE TABLE IF NOT EXISTS module_access (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255) NOT NULL,
       module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
       access_type VARCHAR(50) DEFAULT 'purchase',
       token_id VARCHAR(255),
       expires_at TIMESTAMP,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       metadata JSONB DEFAULT '{}'::jsonb
   );
   
   -- Créer les index
   CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON module_access(user_id);
   CREATE INDEX IF NOT EXISTS idx_module_access_module_id ON module_access(module_id);
   CREATE INDEX IF NOT EXISTS idx_module_access_is_active ON module_access(is_active);
   ```

#### Solution 2 : Vérifier la configuration webhook Stripe

1. **Vérifier l'URL du webhook :**
   ```
   https://iahome.fr/api/webhooks/stripe
   ```

2. **Vérifier les événements configurés :**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`

3. **Tester le webhook :**
   ```bash
   # Dans Stripe CLI
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

#### Solution 3 : Vérifier les variables d'environnement

```bash
# Vérifier que ces variables sont définies
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
echo $STRIPE_WEBHOOK_SECRET
echo $JWT_SECRET
```

#### Solution 4 : Corriger les données existantes

```sql
-- Créer des accès modules pour les tokens existants
INSERT INTO module_access (user_id, module_id, access_type, token_id, expires_at, is_active, metadata)
SELECT 
    at.created_by,
    at.module_id,
    'token' as access_type,
    at.id as token_id,
    at.expires_at,
    at.is_active,
    jsonb_build_object(
        'token_id', at.id,
        'access_level', at.access_level,
        'created_from_token', true
    ) as metadata
FROM access_tokens at
WHERE at.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM module_access ma 
    WHERE ma.user_id = at.created_by 
    AND ma.module_id = at.module_id
    AND ma.is_active = true
);
```

### 🧪 Tests

#### Test 1 : Vérifier l'API webhook
```powershell
# Exécuter le script de test
.\scripts\test-module-automation.ps1
```

#### Test 2 : Test manuel de paiement
1. Effectuer un paiement de test avec StableDiffusion
2. Vérifier les logs webhook
3. Vérifier que l'accès est créé dans `module_access`
4. Vérifier que le module apparaît dans `/encours`

#### Test 3 : Vérifier la page encours
```bash
# Vérifier que la page charge correctement
curl http://localhost:3000/encours
```

### 📊 Monitoring

#### Logs à surveiller
- `logs/traefik/access.log` - Requêtes webhook
- `logs/nginx/error.log` - Erreurs serveur
- Console Supabase - Erreurs base de données

#### Métriques importantes
- Nombre d'accès modules créés
- Taux de succès des webhooks
- Temps de réponse des APIs

### 🔄 Processus de correction automatique

1. **Détection du problème :** Module n'apparaît pas après paiement
2. **Diagnostic :** Exécuter `test-module-automation.ps1`
3. **Correction :** Exécuter `fix-module-automation.ps1`
4. **Vérification :** Tester un nouveau paiement
5. **Monitoring :** Surveiller les logs

### 📝 Notes importantes

- La table `module_access` est **obligatoire** pour l'automatisation
- Les webhooks Stripe doivent être configurés correctement
- Les variables d'environnement doivent être définies
- Les permissions RLS doivent permettre l'insertion

### 🆘 Support

Si le problème persiste après avoir suivi ce guide :

1. Vérifier les logs complets
2. Tester avec un module gratuit
3. Vérifier la configuration Stripe
4. Contacter le support technique








