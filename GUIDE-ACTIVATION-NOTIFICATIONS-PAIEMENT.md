# Guide d'activation des notifications de paiement Stripe

## Problème identifié

Les notifications de paiement ne sont pas envoyées car le service d'email n'est pas correctement configuré. Le système utilise actuellement le mode "console" qui affiche seulement les emails dans les logs au lieu de les envoyer réellement.

## Solution

### Étape 1 : Configurer un service d'email

Vous avez plusieurs options pour envoyer des emails :

#### Option A : Resend (Recommandé - Gratuit jusqu'à 3000 emails/mois)

1. **Créer un compte Resend**
   - Allez sur [resend.com](https://resend.com)
   - Créez un compte gratuit
   - Vérifiez votre domaine ou utilisez un domaine de test

2. **Obtenir la clé API**
   - Dans le dashboard Resend, allez dans "API Keys"
   - Créez une nouvelle clé API
   - Copiez la clé (commence par `re_`)

3. **Configurer les variables d'environnement**
   ```bash
   # Dans votre fichier .env.local
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_votre_cle_api_ici
   RESEND_FROM_EMAIL=noreply@votre-domaine.com
   ```

#### Option B : SendGrid

1. **Créer un compte SendGrid**
   - Allez sur [sendgrid.com](https://sendgrid.com)
   - Créez un compte (gratuit jusqu'à 100 emails/jour)

2. **Obtenir la clé API**
   - Dans le dashboard SendGrid, allez dans "Settings" > "API Keys"
   - Créez une nouvelle clé API
   - Copiez la clé (commence par `SG.`)

3. **Configurer les variables d'environnement**
   ```bash
   # Dans votre fichier .env.local
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.votre_cle_api_ici
   SENDGRID_FROM_EMAIL=noreply@votre-domaine.com
   ```

### Étape 2 : Configurer le webhook Stripe

1. **Dans le dashboard Stripe**
   - Allez dans "Developers" > "Webhooks"
   - Cliquez sur "Add endpoint"

2. **Configurer l'endpoint**
   - URL : `https://home.regispailler.fr/api/webhooks/stripe`
   - Événements à écouter :
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `invoice.payment_succeeded`
     - `payment_intent.payment_failed`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`

3. **Récupérer le secret webhook**
   - Après création, cliquez sur "Reveal" pour voir le secret
   - Copiez le secret (commence par `whsec_`)

4. **Ajouter le secret dans les variables d'environnement**
   ```bash
   # Dans votre fichier .env.local
   STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_ici
   ```

### Étape 3 : Tester la configuration

1. **Redémarrer votre application**
   ```bash
   npm run dev
   ```

2. **Faire un test de paiement**
   - Utilisez une carte de test Stripe
   - Vérifiez que l'email de confirmation est envoyé

3. **Vérifier les logs**
   - Dans la console de développement, vous devriez voir :
   ```
   📧 Email envoyé via Resend: pailleradam@gmail.com
   ```

### Étape 4 : Configuration complète des variables d'environnement

Voici un exemple complet de fichier `.env.local` :

```bash
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M

# Configuration Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook

# Configuration Email (Resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_votre_cle_api_resend
RESEND_FROM_EMAIL=noreply@votre-domaine.com

# Configuration de l'application
NEXT_PUBLIC_APP_URL=https://home.regispailler.fr
NODE_ENV=production
```

## Types d'emails envoyés

Le système envoie automatiquement :

1. **Email de confirmation de paiement** (`checkout.session.completed`)
   - Détails de la transaction
   - Montant payé
   - Articles achetés
   - Lien vers le compte

2. **Email de confirmation d'abonnement** (`invoice.payment_succeeded`)
   - Détails de l'abonnement
   - Période couverte
   - Accès premium

3. **Email d'échec de paiement** (`payment_intent.payment_failed`)
   - Détails de l'erreur
   - Solutions suggérées
   - Lien pour réessayer

4. **Email d'annulation d'abonnement** (`customer.subscription.deleted`)
   - Confirmation d'annulation
   - Date de fin d'accès
   - Lien pour réactiver

## Dépannage

### Les emails ne sont pas envoyés

1. **Vérifiez les variables d'environnement**
   ```bash
   echo $EMAIL_PROVIDER
   echo $RESEND_API_KEY
   ```

2. **Vérifiez les logs de l'application**
   - Cherchez les messages d'erreur dans la console
   - Vérifiez les logs du webhook Stripe

3. **Testez le service d'email**
   ```bash
   # Créez un fichier test-email.js
   const { emailService } = require('./src/utils/emailService');
   
   emailService.sendEmail({
     to: 'test@example.com',
     subject: 'Test',
     html: '<p>Test email</p>'
   });
   ```

### Le webhook Stripe ne fonctionne pas

1. **Vérifiez l'URL du webhook**
   - Doit être accessible publiquement
   - Doit correspondre à l'URL dans Stripe

2. **Vérifiez le secret webhook**
   - Doit correspondre exactement à celui dans Stripe
   - Vérifiez qu'il n'y a pas d'espaces en trop

3. **Vérifiez les logs Stripe**
   - Dans le dashboard Stripe, allez dans "Webhooks"
   - Cliquez sur votre webhook pour voir les tentatives
   - Vérifiez les codes de statut HTTP

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de l'application
2. Testez avec une carte de test Stripe
3. Vérifiez la configuration des variables d'environnement
4. Contactez le support si nécessaire 