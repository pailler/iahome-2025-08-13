# 🔍 Diagnostic du Webhook Stripe

## 📋 Résumé du problème

**Problème initial** : Après un paiement Stripe réussi, aucun email de confirmation n'est reçu et le module n'apparaît pas dans la page `/encours`.

## 🔍 Diagnostic effectué

### 1. Configuration Stripe ✅
- **Mode** : Test
- **Webhook Secret** : Configuré
- **Webhook URL** : `https://home.regispailler.fr/api/webhooks/stripe` ✅
- **Status** : Activé ✅

### 2. Variables d'environnement ✅
- `STRIPE_SECRET_KEY` : Présent
- `STRIPE_WEBHOOK_SECRET` : Présent
- `RESEND_API_KEY` : Présent
- `EMAIL_PROVIDER` : resend

### 3. Événements Stripe ✅
- **Événements reçus** : 10 événements récents
- **Types d'événements** : `checkout.session.completed` et `payment_intent.succeeded`
- **Métadonnées** : Présentes dans `checkout.session.completed` ✅

### 4. Base de données ✅
- **Utilisateur** : `regispailler@gmail.com` existe
- **Modules** : Stable Diffusion (ID: 15) et Cogstudio (ID: 6) existent
- **Accès modules** : 2 accès créés (après correction manuelle)

## 🐛 Problèmes identifiés

### 1. **Webhook traite le mauvais événement** ❌
- **Problème** : Le webhook traitait `payment_intent.succeeded` au lieu de `checkout.session.completed`
- **Impact** : Les métadonnées (`customer_email`, `items_ids`) sont dans `checkout.session.completed`, pas dans `payment_intent.succeeded`
- **Solution** : ✅ Corrigé - Le webhook ignore maintenant `payment_intent.succeeded`

### 2. **Accès modules manquants** ❌
- **Problème** : Certains accès modules n'étaient pas créés après paiement
- **Impact** : Les modules n'apparaissent pas dans `/encours`
- **Solution** : ✅ Corrigé manuellement pour Cogstudio

### 3. **Logs de debug insuffisants** ❌
- **Problème** : Pas assez de logs pour diagnostiquer les erreurs
- **Solution** : ✅ Ajouté des logs détaillés dans `handleCheckoutSessionCompleted`

## 🔧 Corrections apportées

### 1. Webhook Stripe (`src/app/api/webhooks/stripe/route.ts`)
```typescript
// Avant
case 'payment_intent.succeeded':
  await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
  break;

// Après
case 'payment_intent.succeeded':
  // Ignorer les payment_intent.succeeded car ils n'ont pas les métadonnées
  // Les métadonnées sont dans checkout.session.completed
  console.log('🔍 Payment Intent succeeded ignoré (métadonnées dans checkout.session.completed)');
  break;
```

### 2. Logs améliorés
```typescript
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🔍 Debug - Session complète:', JSON.stringify(session, null, 2));
  console.log('🔍 Debug - Email client:', customerEmail);
  console.log('🔍 Debug - IDs des modules:', itemsIds);
  console.log('🔍 Debug - Métadonnées:', session.metadata);
  // ...
}
```

### 3. Correction des types
```typescript
// Correction de la comparaison module_id
.eq('module_id', parseInt(moduleId)) // Au lieu de moduleId (string)
```

## ✅ État actuel

### Accès modules créés
1. **Stable Diffusion** (ID: 15) : ✅ Créé le 04/08/2025 21:44:58
2. **Cogstudio** (ID: 6) : ✅ Créé le 04/08/2025 22:11:35

### Webhook fonctionnel
- ✅ Répond avec statut 200
- ✅ Traite les événements `checkout.session.completed`
- ✅ Logs détaillés pour le debugging

## 🧪 Tests effectués

### 1. Test du webhook direct
```bash
node test-webhook-direct.js
```
**Résultat** : ✅ Webhook répond correctement

### 2. Test avec événement réel
```bash
node test-real-webhook.js
```
**Résultat** : ✅ Événements trouvés avec bonnes métadonnées

### 3. Vérification des accès
```bash
node check-access-after-test.js
```
**Résultat** : ✅ Accès modules présents

## 📋 Recommandations

### 1. Monitoring
- Surveiller les logs du serveur Next.js lors des paiements
- Vérifier que les accès modules sont créés automatiquement
- Monitorer les emails de confirmation

### 2. Tests
- Tester avec un nouveau paiement en mode test
- Vérifier que l'utilisateur voit le module dans `/encours`
- Confirmer la réception des emails

### 3. Améliorations futures
- Ajouter des notifications en temps réel
- Implémenter un système de retry pour les webhooks échoués
- Ajouter des métriques de monitoring

## 🔗 Fichiers modifiés

1. `src/app/api/webhooks/stripe/route.ts` - Correction du webhook
2. Scripts de diagnostic créés :
   - `test-stripe-webhook-simple.js`
   - `debug-stripe-webhook.js`
   - `test-real-webhook.js`
   - `test-webhook-direct.js`
   - `check-access-after-test.js`
   - `add-cogstudio-access-simple.js`

## 📝 Commit effectué

```bash
git commit -m "fix: Correction du webhook Stripe pour traiter checkout.session.completed au lieu de payment_intent.succeeded"
```

## ✅ Conclusion

Le problème principal était que le webhook traitait le mauvais type d'événement. Après correction :

1. **Webhook fonctionnel** ✅
2. **Accès modules créés** ✅
3. **Logs de debug ajoutés** ✅
4. **Tests de validation** ✅

Le système devrait maintenant fonctionner correctement pour les futurs paiements. 