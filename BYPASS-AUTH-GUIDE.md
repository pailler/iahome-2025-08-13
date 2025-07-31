# 🔐 Guide d'Outrepassement d'Identification

Ce guide explique comment utiliser la nouvelle fonction d'outrepassement d'identification pour accéder automatiquement à vos applications comme Stable Diffusion, IATube, etc.

## 📋 Vue d'ensemble

La fonction d'outrepassement d'identification permet d'accéder automatiquement à vos applications sans avoir à saisir manuellement les identifiants. Elle utilise plusieurs méthodes d'authentification pour maximiser les chances de succès.

## 🚀 Méthodes d'authentification disponibles

### 1. 🔐 Authentification Basic HTTP
- **Fonctionnement** : Envoie les credentials dans l'en-tête `Authorization: Basic`
- **Avantages** : Rapide, fonctionne avec les serveurs qui supportent l'auth HTTP Basic
- **Limitations** : Ne fonctionne pas si l'application utilise des formulaires de connexion

### 2. 💉 Injection de formulaire JavaScript
- **Fonctionnement** : Injecte du JavaScript pour remplir automatiquement les formulaires de connexion
- **Avantages** : Fonctionne avec la plupart des applications web
- **Fonctionnalités** :
  - Recherche intelligente des champs de connexion
  - Remplissage automatique des identifiants
  - Soumission automatique du formulaire
  - Tentatives multiples en cas d'échec

### 3. 🍪 Gestion des cookies de session
- **Fonctionnement** : Gère les cookies de session pour maintenir l'authentification
- **Avantages** : Maintient la session active
- **Utilisation** : Complémentaire aux autres méthodes

### 4. 🤖 Mode automatique
- **Fonctionnement** : Essaie toutes les méthodes dans l'ordre jusqu'à ce qu'une fonctionne
- **Avantages** : Maximise les chances de succès
- **Ordre des tentatives** : Basic Auth → Form Injection → Cookie Session

## 🛠️ Utilisation

### Via l'API REST

#### Méthode PUT - Outrepassement d'identification
```bash
curl -X PUT http://localhost:3000/api/module-access \
  -H "Content-Type: application/json" \
  -d '{
    "module": "stablediffusion",
    "method": "auto",
    "action": "bypass"
  }'
```

#### Méthode GET - Accès direct
```bash
curl "http://localhost:3000/api/module-access?module=stablediffusion"
```

### Via l'interface web

1. Accédez à `/test-bypass-auth`
2. Sélectionnez le module à tester
3. Choisissez la méthode d'authentification
4. Cliquez sur "Tester l'outrepassement d'identification"

### Via JavaScript

```javascript
// Test d'outrepassement
const response = await fetch('/api/module-access', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    module: 'stablediffusion',
    method: 'auto',
    action: 'bypass'
  }),
});

if (response.ok) {
  const html = await response.text();
  // Ouvrir dans une nouvelle fenêtre
  const newWindow = window.open('', '_blank');
  newWindow.document.write(html);
  newWindow.document.close();
}
```

## 📊 Modules configurés

| Module | URL | Méthodes supportées |
|--------|-----|-------------------|
| stablediffusion | https://stablediffusion.regispailler.fr | basic-auth, form-injection, cookie-session, header-override |
| iatube | https://iatube.regispailler.fr | basic-auth, form-injection, cookie-session |
| iametube | https://iametube.regispailler.fr | basic-auth, form-injection, cookie-session |

## 🧪 Tests

### Script de test automatique
```bash
# Test complet de tous les modules
node test-bypass-auth.js

# Test spécifique pour Stable Diffusion
node test-bypass-auth.js --stable-diffusion
```

### Test manuel
1. Démarrez votre serveur Next.js : `npm run dev`
2. Accédez à `http://localhost:3000/test-bypass-auth`
3. Testez les différentes méthodes

## 🔧 Configuration

### Ajouter un nouveau module

Modifiez le fichier `src/app/api/module-access/route.ts` :

```typescript
const MODULES_CONFIG = {
  // ... modules existants
  nouveaumodule: {
    url: 'https://nouveaumodule.regispailler.fr',
    credentials: { username: 'admin', password: 'motdepasse' },
    type: 'http-basic',
    authMethods: ['basic-auth', 'form-injection', 'cookie-session']
  }
};
```

### Personnaliser les méthodes d'authentification

Vous pouvez modifier la fonction `bypassAuthentication` pour ajouter de nouvelles méthodes ou personnaliser les existantes.

## 🚨 Dépannage

### Problèmes courants

1. **Erreur 401/403** : L'authentification Basic HTTP a échoué
   - **Solution** : Essayez la méthode `form-injection`

2. **Page de connexion toujours visible** : L'injection JavaScript n'a pas fonctionné
   - **Solution** : Vérifiez que les champs de connexion sont bien détectés

3. **Erreur de CORS** : Problème de politique de sécurité
   - **Solution** : Utilisez le proxy Next.js plutôt qu'un accès direct

### Logs de débogage

Les logs détaillés sont disponibles dans la console du serveur :
- `🔐 Accès module PUT demandé` : Début de la requête
- `✅ Authentification Basic réussie` : Succès de l'auth Basic
- `💉 Injection de formulaire` : Tentative d'injection JavaScript
- `❌ Échec` : Échec d'une méthode

## 🔒 Sécurité

### Bonnes pratiques

1. **Credentials sécurisés** : Stockez les mots de passe de manière sécurisée
2. **HTTPS obligatoire** : Utilisez toujours HTTPS en production
3. **Logs limités** : Évitez de logger les credentials
4. **Accès restreint** : Limitez l'accès à cette API

### Limitations

- Cette fonction ne contourne pas les authentifications à deux facteurs
- Certaines applications peuvent détecter l'automatisation
- Les sessions peuvent expirer et nécessiter une nouvelle authentification

## 📈 Améliorations futures

- [ ] Support des authentifications à deux facteurs
- [ ] Gestion des captchas
- [ ] Rotation automatique des credentials
- [ ] Monitoring des sessions
- [ ] Interface d'administration pour la configuration

## 🤝 Support

Pour toute question ou problème :
1. Consultez les logs du serveur
2. Testez avec différentes méthodes
3. Vérifiez la configuration du module
4. Consultez ce guide de dépannage 