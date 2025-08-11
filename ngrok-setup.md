# Configuration Ngrok pour les webhooks Stripe

## Étape 1 : Installer Ngrok

1. **Téléchargez ngrok** depuis https://ngrok.com/
2. **Extrayez le fichier** dans un dossier
3. **Créez un compte gratuit** sur ngrok.com

## Étape 2 : Configurer Ngrok

1. **Connectez-vous** à votre compte ngrok
2. **Récupérez votre authtoken** dans le dashboard
3. **Configurez ngrok** :
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

## Étape 3 : Créer le tunnel

```bash
# Tunnel pour HTTP
ngrok http 80

# Ou tunnel pour HTTPS
ngrok http 443
```

## Étape 4 : Utiliser l'URL ngrok

L'URL générée ressemblera à : `https://abc123.ngrok.io`

## Étape 5 : Configurer Stripe

Dans votre dashboard Stripe :
- **Webhook URL** : `https://abc123.ngrok.io/api/webhooks/stripe`
- **Événements** : `checkout.session.completed`, `payment_intent.succeeded`






