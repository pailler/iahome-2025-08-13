# 📧 Guide de Configuration des Notifications Email

## 🔍 Problème identifié

Votre application ne reçoit pas de notifications par email après paiement car :
1. **Aucun webhook Stripe** configuré
2. **Aucun service d'email** intégré
3. **Pas de gestion des événements** de paiement

## 🛠️ Solution mise en place

J'ai créé un système complet de notifications :

### 1. Webhook Stripe (`/api/webhooks/stripe`)
- Capture les événements de paiement Stripe
- Gère `checkout.session.completed`, `payment_intent.succeeded`, `invoice.payment_succeeded`
- Envoie automatiquement les emails de confirmation

### 2. Service d'Email (`/utils/emailService.ts`)
- Support multiple services d'email (Resend, SendGrid, Nodemailer)
- Templates d'emails professionnels
- Mode console pour les tests

### 3. Templates d'Emails
- ✅ Confirmation de paiement
- ✅ Confirmation d'abonnement
- Design responsive et professionnel

## 📋 Configuration requise

### Variables d'environnement à ajouter dans `.env.local` :

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Provider (choisir un)
EMAIL_PROVIDER=console  # Pour les tests
# EMAIL_PROVIDER=resend
# EMAIL_PROVIDER=sendgrid
# EMAIL_PROVIDER=nodemailer

# Resend Configuration (optionnel)
RESEND_API_KEY=re_...

# SendGrid Configuration (optionnel)
SENDGRID_API_KEY=SG...

# SMTP Configuration (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Configuration du Webhook Stripe

### 1. Dans votre dashboard Stripe :
1. Allez dans **Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/webhooks/stripe`
4. Événements à sélectionner :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`

### 2. Récupérer le secret webhook :
1. Copiez le **Signing secret** du webhook créé
2. Ajoutez-le dans `.env.local` : `STRIPE_WEBHOOK_SECRET=whsec_...`

## 📧 Services d'Email recommandés

### Option 1 : Resend (Recommandé)
```bash
npm install resend
```

Dans `.env.local` :
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
```

### Option 2 : SendGrid
```bash
npm install @sendgrid/mail
```

Dans `.env.local` :
```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG...
```

### Option 3 : Nodemailer (SMTP)
```bash
npm install nodemailer
```

Dans `.env.local` :
```bash
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🧪 Test de la configuration

### 1. Mode Console (pour les tests)
```bash
EMAIL_PROVIDER=console
```

Les emails seront affichés dans la console du serveur.

### 2. Test du webhook
```bash
# Installer Stripe CLI
stripe listen --forward-to localhost:8021/api/webhooks/stripe
```

### 3. Test d'un paiement
1. Effectuez un paiement de test
2. Vérifiez les logs du serveur
3. Vérifiez la réception de l'email

## 📝 Exemples d'emails

### Email de confirmation de paiement :
- ✅ Titre : "Paiement confirmé - IA Home"
- 📊 Détails de la transaction
- 📦 Liste des articles achetés
- 🎨 Design professionnel

### Email de confirmation d'abonnement :
- ✅ Titre : "Abonnement activé - IA Home"
- 📅 Période d'abonnement
- 🎉 Avantages premium
- 💰 Montant payé

## 🔧 Dépannage

### Problème : Webhook non reçu
1. Vérifiez l'URL du webhook dans Stripe
2. Vérifiez `STRIPE_WEBHOOK_SECRET`
3. Testez avec Stripe CLI

### Problème : Emails non envoyés
1. Vérifiez `EMAIL_PROVIDER` dans `.env.local`
2. Vérifiez les clés API du service d'email
3. Consultez les logs du serveur

### Problème : Erreur de signature
1. Vérifiez `STRIPE_WEBHOOK_SECRET`
2. Régénérez le secret webhook dans Stripe
3. Redéployez l'application

## 🎯 Prochaines étapes

1. **Configurez les variables d'environnement**
2. **Choisissez un service d'email**
3. **Configurez le webhook Stripe**
4. **Testez avec un paiement de test**
5. **Vérifiez la réception des emails**

Une fois configuré, vos utilisateurs recevront automatiquement des emails de confirmation après chaque paiement réussi ! 