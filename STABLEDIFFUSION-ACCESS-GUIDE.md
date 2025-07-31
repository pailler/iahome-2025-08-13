# Guide d'accès à Stable Diffusion

## 🎨 Bouton "Accéder à Stable Diffusion"

Un nouveau bouton a été ajouté sur la page d'accueil d'IAHome pour permettre un accès direct à Stable Diffusion avec authentification automatique.

### 📍 Emplacement

Le bouton se trouve dans la **section héros** de la page d'accueil, juste en dessous de la barre de recherche.

### 🔐 Fonctionnalités

- **Authentification automatique** : Les credentials `admin/Rasulova75` sont automatiquement injectés
- **Magic link sécurisé** : Utilise un token temporaire pour l'accès
- **Ouverture en nouvel onglet** : L'interface Stable Diffusion s'ouvre dans un nouvel onglet
- **Expiration** : Le magic link expire après 24 heures

### 🚀 Utilisation

1. **Accédez à la page d'accueil** d'IAHome (`http://localhost:8021`)
2. **Localisez le bouton** "Accéder à Stable Diffusion" dans la section héros
3. **Cliquez sur le bouton** avec le dégradé violet/rose
4. **L'interface Stable Diffusion** s'ouvrira automatiquement dans un nouvel onglet

### 🔧 Configuration technique

#### Magic Link créé
- **Token** : `46e2c757429488251079882de116364f418a9ed0e318027720ae524569db63f4`
- **Module** : `stablediffusion`
- **URL cible** : `https://stablediffusion.regispailler.fr`
- **Credentials** : `admin/Rasulova75`

#### Variables d'environnement requises
```env
STABLEDIFFUSION_USERNAME=admin
STABLEDIFFUSION_PASSWORD=Rasulova75
```

### 🧪 Tests

#### Script de test
Un script de test est disponible pour vérifier le bon fonctionnement :
```bash
node test-stablediffusion-access.js
```

#### Test manuel
1. Ouvrez votre navigateur
2. Allez sur `http://localhost:8021`
3. Cliquez sur le bouton "Accéder à Stable Diffusion"
4. Vérifiez que l'interface Stable Diffusion se charge correctement

### 🔄 Régénération du magic link

Si le magic link expire ou si vous souhaitez en créer un nouveau :

```bash
node create-stablediffusion-magic-link.js
```

Puis mettez à jour le token dans le code de la page d'accueil (`src/app/page.tsx`).

### 🛠️ Dépannage

#### Problème : "Token invalide ou expiré"
- Le magic link a expiré (24 heures)
- Régénérez un nouveau magic link

#### Problème : "Erreur lors de l'accès"
- Vérifiez que le serveur IAHome est démarré
- Vérifiez que les variables d'environnement sont configurées
- Vérifiez la connectivité vers `stablediffusion.regispailler.fr`

#### Problème : "Credentials incorrects"
- Vérifiez que `STABLEDIFFUSION_USERNAME` et `STABLEDIFFUSION_PASSWORD` sont corrects
- Vérifiez que les credentials sont valides sur le serveur Stable Diffusion

### 📝 Notes importantes

- Le bouton utilise le système de proxy d'IAHome pour injecter automatiquement les credentials
- L'accès est sécurisé par un token temporaire
- L'interface Stable Diffusion s'ouvre dans un iframe via le proxy
- Tous les assets (CSS, JS, images) sont automatiquement proxyés

### 🔒 Sécurité

- Le magic link expire automatiquement après 24 heures
- Les credentials ne sont jamais exposés côté client
- L'authentification se fait côté serveur via le proxy
- Chaque accès est validé par le système de permissions d'IAHome 