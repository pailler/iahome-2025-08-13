# 🔧 Correction de l'Automatisation des Modules

## 🚨 Problème Identifié

L'automatisation de l'ajout d'un nouveau module après paiement ne fonctionne pas car la table `module_access` n'existe pas dans la base de données, mais le code l'utilise.

## ✅ Solution Simple

### Étape 1 : Créer la table manquante

1. **Ouvrir l'interface Supabase** de votre projet
2. **Aller dans l'éditeur SQL**
3. **Copier et exécuter le script** `scripts/create-module-access-manual.sql`

### Étape 2 : Vérifier la correction

1. **Aller sur votre site** : `https://iahome.fr/encours`
2. **Vérifier que les modules existants apparaissent**
3. **Tester un nouveau paiement** avec StableDiffusion

## 🔍 Diagnostic

Si le problème persiste, vérifiez :

1. **Les logs webhook Stripe** dans la console Supabase
2. **Les variables d'environnement** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`

3. **La configuration webhook Stripe** :
   - URL : `https://iahome.fr/api/webhooks/stripe`
   - Événements : `checkout.session.completed`

## 📋 Script SQL à exécuter

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

-- Créer des accès pour les tokens existants
INSERT INTO module_access (user_id, module_id, access_type, token_id, expires_at, is_active, metadata)
SELECT 
    at.created_by,
    at.module_id,
    'token' as access_type,
    at.id as token_id,
    at.expires_at,
    at.is_active,
    jsonb_build_object('token_id', at.id, 'created_from_token', true) as metadata
FROM access_tokens at
WHERE at.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM module_access ma 
    WHERE ma.user_id = at.created_by 
    AND ma.module_id = at.module_id
    AND ma.is_active = true
);
```

## 🎯 Résultat Attendu

Après avoir exécuté le script :

1. ✅ La table `module_access` existe
2. ✅ Les modules existants apparaissent dans `/encours`
3. ✅ Les nouveaux paiements créent automatiquement des accès
4. ✅ Les modules apparaissent immédiatement après paiement

## 🆘 Support

Si le problème persiste :

1. Vérifiez les logs dans la console Supabase
2. Testez avec un module gratuit
3. Vérifiez la configuration Stripe
4. Contactez le support technique

---

**Note :** Cette correction résout le problème principal d'automatisation. Les modules achetés devraient maintenant apparaître automatiquement dans la page `/encours`.








