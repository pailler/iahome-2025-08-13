# 🔐 Configuration JWT pour l'authentification automatique

## Vue d'ensemble

Cette solution génère des tokens JWT côté serveur pour l'authentification automatique sans demander de mot de passe. Elle utilise les informations FusionAuth pour la compatibilité mais génère les JWT localement.

## 📋 Configuration

### 1. Variables d'environnement

Ajouter dans votre fichier `.env` :

```env
# Configuration FusionAuth (pour référence)
FUSIONAUTH_BASE_URL=https://fusionauth.regispailler.fr
FUSIONAUTH_API_KEY=H6DZYq4RFdFh87J9DkhNdvo0U7Lqb1yUmK6YmwOU
FUSIONAUTH_APPLICATION_ID=a3bd1666-71cd-4037-8037-322126502010
FUSIONAUTH_CLIENT_SECRET=7KT8f8LCBXHwOYCOr1zDKrpodB5EgSaTunpRkN5rgro
FUSIONAUTH_TENANT_ID=b1df6d92-e242-10ab-874d-6fe852a7a7fe

# Clé secrète pour signer les JWT (IMPORTANT: changez cette clé en production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 🔄 Flux d'authentification

### 1. Génération du token JWT

```javascript
// API /api/fusionauth-token
POST /api/fusionauth-token
{
  "userId": "user-id",
  "userEmail": "user@example.com",
  "module": "stablediffusion"
}
```

### 2. Réponse

```json
{
  "success": true,
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "userId": "user-id",
  "module": "stablediffusion",
  "payload": {
    "iss": "iahome.regispailler.fr",
    "aud": "stablediffusion.regispailler.fr",
    "sub": "user-id",
    "email": "user@example.com",
    "module": "stablediffusion",
    "iat": 1640995200,
    "exp": 1640998800
  }
}
```

### 3. Redirection avec token

```javascript
const authUrl = `https://stablediffusion.regispailler.fr?jwt=${jwt}`;
window.open(authUrl, '_blank');
```

## 🛠️ Configuration côté serveur (Stable Diffusion)

### 1. Middleware d'authentification

```python
# middleware.py
import jwt
from functools import wraps
from flask import request, jsonify

def verify_jwt_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.args.get('jwt') or request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        try:
            # Vérifier le token JWT
            payload = jwt.decode(
                token, 
                JWT_SECRET,  # Même clé secrète que côté client
                algorithms=['HS256'],
                issuer='iahome.regispailler.fr',
                audience='stablediffusion.regispailler.fr'
            )
            
            # Ajouter les informations utilisateur à la requête
            request.user = payload
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
    
    return decorated_function
```

### 2. Utilisation dans les routes

```python
@app.route('/')
@verify_jwt_token
def index():
    user = request.user
    return render_template('index.html', user=user)
```

## 🔒 Sécurité

### 1. Validation des tokens

- ✅ **Signature** : Vérification de la signature JWT avec HMAC-SHA256
- ✅ **Expiration** : Vérification de la date d'expiration
- ✅ **Émetteur** : Vérification de l'émetteur (issuer)
- ✅ **Audience** : Vérification de l'audience (audience)

### 2. Permissions

```javascript
// Vérification des permissions dans le token
const payload = jwt.decode(token);
if (payload.module === 'stablediffusion') {
    // Accès autorisé
}
```

## 🧪 Test

### 1. Bouton de test

Le bouton "FusionAuth Test" dans la bannière permet de tester :

1. **Génération du token JWT**
2. **Redirection vers Stable Diffusion**
3. **Authentification automatique**

### 2. Logs de débogage

```bash
# Vérifier les logs
tail -f logs/application.log
```

## 📚 Ressources

- [JWT.io](https://jwt.io/) - Décodeur et documentation JWT
- [Node.js Crypto](https://nodejs.org/api/crypto.html) - Documentation HMAC
- [FusionAuth Documentation](https://fusionauth.io/docs/) - Référence FusionAuth 