# 🔧 Guide de Configuration Application Externe

## 📋 Vue d'ensemble

Ce guide vous aide à configurer votre application externe (comme `https://metube.regispailler.fr`) pour valider les magic links générés par votre application principale.

## 🚀 Étapes de configuration

### 1. **Intégrer le script de validation**

Ajoutez le script de validation dans votre application externe :

```html
<!-- Dans le <head> de votre application externe -->
<script>
// Configuration
const APP_PRINCIPALE_URL = 'https://votre-app-principale.com'; // URL de votre app principale

/**
 * Valider un magic link côté application externe
 */
async function validateMagicLink(token) {
  try {
    const response = await fetch(`${APP_PRINCIPALE_URL}/api/validate-magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        valid: true,
        userData: data.magicLinkData
      };
    } else {
      return {
        valid: false,
        error: data.error
      };
    }
  } catch (error) {
    console.error('Erreur validation magic link:', error);
    return {
      valid: false,
      error: 'Erreur de connexion'
    };
  }
}

/**
 * Vérifier l'authentification au chargement de la page
 */
function checkAuthentication() {
  const magicLink = new URLSearchParams(window.location.search).get('magic_link');
  
  if (magicLink) {
    console.log('🔍 Magic link détecté, validation en cours...');
    
    validateMagicLink(magicLink).then(result => {
      if (result.valid) {
        console.log('✅ Magic link valide, authentification...');
        authenticateUser(result.userData);
        
        // Nettoyer l'URL
        const url = new URL(window.location);
        url.searchParams.delete('magic_link');
        window.history.replaceState({}, '', url);
      } else {
        console.error('❌ Magic link invalide:', result.error);
        showError('Lien d\'accès invalide ou expiré');
      }
    });
  } else {
    // Vérifier si l'utilisateur est déjà authentifié
    const storedUser = localStorage.getItem('authenticated_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log('✅ Utilisateur déjà authentifié:', userData);
      authenticateUser(userData);
    } else {
      console.log('❌ Aucune authentification trouvée');
      showLoginForm();
    }
  }
}

/**
 * Authentifier l'utilisateur dans l'application externe
 */
function authenticateUser(userData) {
  // Stocker les informations d'authentification
  localStorage.setItem('authenticated_user', JSON.stringify({
    userId: userData.userId,
    moduleName: userData.moduleName,
    permissions: userData.permissions,
    authenticatedAt: new Date().toISOString()
  }));

  // Masquer la page de login et afficher le contenu
  const loginForm = document.getElementById('login-form');
  const mainContent = document.getElementById('main-content');
  
  if (loginForm) loginForm.style.display = 'none';
  if (mainContent) mainContent.style.display = 'block';

  console.log('✅ Utilisateur authentifié:', userData);
}

/**
 * Déconnecter l'utilisateur
 */
function logout() {
  localStorage.removeItem('authenticated_user');
  window.location.reload();
}

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', checkAuthentication);
</script>
```

### 2. **Structure HTML recommandée**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre Application Externe</title>
    <!-- Votre CSS ici -->
</head>
<body>
    <!-- Message d'erreur -->
    <div id="error-message" style="display: none; background: #f8d7da; color: #721c24; padding: 10px; margin: 10px; border-radius: 5px;"></div>

    <!-- Formulaire de login (affiché par défaut) -->
    <div id="login-form">
        <h2>🔐 Connexion requise</h2>
        <p>Cette application nécessite une authentification via magic link.</p>
        <p>Accédez à cette application depuis votre plateforme principale.</p>
    </div>

    <!-- Contenu principal (masqué par défaut) -->
    <div id="main-content" style="display: none;">
        <!-- Votre contenu d'application ici -->
        <h1>Bienvenue dans votre application !</h1>
        <p>Vous êtes maintenant authentifié.</p>
        
        <button onclick="logout()">🚪 Déconnexion</button>
    </div>

    <!-- Script de validation (voir étape 1) -->
</body>
</html>
```

### 3. **Configuration CORS (si nécessaire)**

Si votre application externe est sur un domaine différent, vous devrez configurer CORS dans votre application principale.

Dans votre application Next.js, ajoutez dans `next.config.ts` :

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/validate-magic-link',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://metube.regispailler.fr', // Votre domaine externe
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
};
```

### 4. **Variables d'environnement**

Dans votre application externe, configurez :

```javascript
// Configuration
const APP_PRINCIPALE_URL = 'https://votre-app-principale.com'; // URL de votre app principale
```

## 🧪 Test de l'intégration

### 1. **Tester la génération de magic link**

1. Allez sur `http://localhost:3000/test-magic-link`
2. Générez un magic link
3. Copiez l'URL générée

### 2. **Tester l'application externe**

1. Ouvrez votre application externe
2. Collez l'URL avec le magic link dans la barre d'adresse
3. Vérifiez que l'authentification fonctionne

### 3. **Exemple d'URL de test**

```
https://metube.regispailler.fr?magic_link=abc123.def456.ghi789
```

## 🔒 Sécurité

### **Bonnes pratiques :**

1. **HTTPS obligatoire** en production
2. **Validation côté serveur** des magic links
3. **Expiration automatique** des tokens
4. **Nettoyage des URLs** après validation
5. **Logs de sécurité** pour tracer les accès

### **Configuration de sécurité :**

```javascript
// Vérifier les permissions
function hasPermission(userData, permission) {
  return userData.permissions && userData.permissions.includes(permission);
}

// Vérifier l'expiration
function isTokenExpired(userData) {
  return userData.expiresAt < Date.now();
}

// Validation complète
function validateUserAccess(userData) {
  if (!userData) return false;
  if (isTokenExpired(userData)) return false;
  if (!hasPermission(userData, 'access')) return false;
  return true;
}
```

## 🚨 Dépannage

### **Problème : Erreur CORS**
```javascript
// Solution : Configurer CORS dans votre app principale
// Voir étape 3 ci-dessus
```

### **Problème : Magic link invalide**
```javascript
// Vérifier :
// 1. Le secret MAGIC_LINK_SECRET est identique
// 2. L'URL de l'API est correcte
// 3. Le token n'a pas expiré
```

### **Problème : Erreur de connexion**
```javascript
// Vérifier :
// 1. L'application principale est accessible
// 2. L'API /api/validate-magic-link fonctionne
// 3. Les logs côté serveur
```

## 📚 Ressources

- [Documentation Next.js CORS](https://nextjs.org/docs/api-routes/api-middlewares)
- [Guide localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [URLSearchParams API](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## 🔧 Support

Pour toute question ou problème :
1. Vérifiez les logs de la console navigateur
2. Testez l'API de validation directement
3. Vérifiez la configuration CORS
4. Consultez les logs de votre application principale 