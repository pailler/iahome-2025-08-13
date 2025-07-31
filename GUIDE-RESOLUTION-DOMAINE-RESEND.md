# Guide de résolution - Domaine non vérifié dans Resend

## Problème identifié

L'erreur indique que le domaine `hotmail.com` n'est pas vérifié dans Resend :
```
The hotmail.com domain is not verified. Please, add and verify your domain on https://resend.com/domains
```

## Solution

### Option 1 : Utiliser le domaine de test Resend (Recommandé pour les tests)

1. **Allez dans le dashboard Resend**
   - Connectez-vous sur [resend.com](https://resend.com)
   - Allez dans "Domains"

2. **Utiliser le domaine de test**
   - Resend fournit automatiquement un domaine de test
   - Il ressemble à : `onboarding@resend.dev` ou `noreply@resend.dev`

3. **Mettre à jour votre `.env.local`**
   ```bash
   # Remplacer cette ligne :
   RESEND_FROM_EMAIL=formateur_tic@hotmail.com
   
   # Par celle-ci :
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

### Option 2 : Vérifier votre propre domaine (Pour la production)

1. **Acheter un domaine** (si vous n'en avez pas)
   - Exemple : `iahome.fr`, `regispailler.fr`
   - Achetez-le chez un registrar (OVH, Namecheap, etc.)

2. **Ajouter le domaine dans Resend**
   - Dans le dashboard Resend, allez dans "Domains"
   - Cliquez sur "Add Domain"
   - Entrez votre domaine (ex: `iahome.fr`)

3. **Configurer les DNS**
   - Resend vous donnera des enregistrements DNS à ajouter
   - Allez chez votre registrar et ajoutez ces enregistrements
   - Attendez la vérification (peut prendre jusqu'à 24h)

4. **Mettre à jour votre `.env.local`**
   ```bash
   RESEND_FROM_EMAIL=noreply@votre-domaine.com
   ```

### Option 3 : Utiliser SendGrid à la place

Si vous préférez utiliser SendGrid :

1. **Créer un compte SendGrid**
   - Allez sur [sendgrid.com](https://sendgrid.com)
   - Créez un compte gratuit

2. **Obtenir la clé API**
   - Dans le dashboard, allez dans "Settings" > "API Keys"
   - Créez une nouvelle clé API

3. **Mettre à jour votre `.env.local`**
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.votre_cle_api_ici
   SENDGRID_FROM_EMAIL=noreply@votre-domaine.com
   ```

## Solution rapide pour tester

Pour tester immédiatement, utilisez le domaine de test Resend :

1. **Modifiez votre fichier `.env.local`**
   ```bash
   # Remplacez cette ligne :
   RESEND_FROM_EMAIL=formateur_tic@hotmail.com
   
   # Par celle-ci :
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

2. **Retestez la configuration**
   ```bash
   node test-email-simple.js
   ```

3. **Vérifiez que les emails sont envoyés**
   - Les emails de test iront dans votre boîte de réception
   - Les emails de paiement iront à `pailleradam@gmail.com`

## Configuration finale recommandée

Pour la production, voici la configuration recommandée :

```bash
# Configuration Email Resend
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_votre_cle_api_ici
RESEND_FROM_EMAIL=noreply@iahome.fr

# Configuration Webhook Stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_ici
```

## Étapes suivantes

1. **Pour les tests immédiats** : Utilisez `onboarding@resend.dev`
2. **Pour la production** : Vérifiez votre propre domaine
3. **Testez les paiements** : Faites un vrai test de paiement Stripe
4. **Vérifiez les notifications** : Confirmez que les emails sont reçus

## Support

- **Resend Support** : https://resend.com/support
- **Documentation Resend** : https://resend.com/docs
- **Guide de vérification de domaine** : https://resend.com/docs/domains 