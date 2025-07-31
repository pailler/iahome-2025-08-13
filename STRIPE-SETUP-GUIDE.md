# Guide de Configuration Stripe

## Problème actuel
Le bouton "Activer les sélections" ne fonctionne pas car les variables d'environnement Stripe ne sont pas configurées.

## Solution

### 1. Créer un compte Stripe
1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte gratuit
3. Accédez au dashboard Stripe

### 2. Obtenir les clés API
1. Dans le dashboard Stripe, allez dans **Developers** > **API keys**
2. Copiez les clés suivantes :
   - **Publishable key** (commence par `pk_test_`)
   - **Secret key** (commence par `sk_test_`)

### 3. Configurer les variables d'environnement
Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:8021

# Autres variables existantes...
```

### 4. Redémarrer le serveur
Après avoir ajouté les variables d'environnement :
```bash
npm run dev
```

### 5. Tester la configuration
Exécutez le script de test :
```bash
node test-stripe-config.js
```

## Variables d'environnement requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (côté serveur) | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe (côté client) | `pk_test_...` |
| `NEXT_PUBLIC_APP_URL` | URL de votre application | `http://localhost:8021` |

## Erreurs courantes

### Erreur 500 "Configuration Stripe manquante"
- **Cause** : Variables d'environnement non configurées
- **Solution** : Ajouter les clés Stripe dans `.env.local`

### Erreur "Invalid API key"
- **Cause** : Clé Stripe invalide ou mal copiée
- **Solution** : Vérifier et recopier les clés depuis le dashboard Stripe

### Erreur "Currency not supported"
- **Cause** : Devise non supportée par votre compte Stripe
- **Solution** : Vérifier que votre compte Stripe supporte l'EUR

## Test du paiement

1. Sélectionnez des modules sur la page d'accueil
2. Cliquez sur "Confirmer la(es) sélection(s)"
3. Remplissez le formulaire de paiement Stripe avec les données de test :
   - **Numéro de carte** : `4242 4242 4242 4242`
   - **Date d'expiration** : `12/25`
   - **CVC** : `123`
   - **Code postal** : `12345`

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console du navigateur
2. Vérifiez les logs du serveur Next.js
3. Testez avec le script `test-stripe-config.js` 