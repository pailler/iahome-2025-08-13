# 🔐 Guide JWT sans licence FusionAuth

## Vue d'ensemble

Cette solution permet de créer des tokens JWT pour l'authentification automatique **sans licence FusionAuth**. Nous générons les JWT côté serveur avec les informations FusionAuth intégrées.

## ✅ Ce qui fonctionne déjà

### **1. API de génération JWT** :
- **Fichier** : `src/app/api/fusionauth-token/route.ts`
- **Endpoint** : `POST /api/fusionauth-token`
- **Fonction** : Génère des JWT signés avec HMAC-SHA256

### **2. Bouton de test** :
- **Emplacement** : Bannière principale
- **Fonction** : Teste la génération JWT et redirection

### **3. Configuration** :
- **FusionAuth** : Utilise les IDs pour référence
- **JWT** : Génération côté serveur sécurisée

## 🚀 Comment utiliser

### **1. Variables d'environnement** :

Ajoutez dans votre `.env` :
```env
# Clé secrète pour signer les JWT (IMPORTANT: changez en production)
JWT_SECRET=votre-cle-secrete-jwt-super-securisee

# Configuration FusionAuth (pour référence)
FUSIONAUTH_BASE_URL=https://fusionauth.regispailler.fr
FUSIONAUTH_API_KEY=H6DZYq4RFdFh87J9DkhNdvo0U7Lqb1yUmK6YmwOU
FUSIONAUTH_APPLICATION_ID=a3bd1666-71cd-4037-8037-322126502010
FUSIONAUTH_CLIENT_SECRET=7KT8f8LCBXHwOYCOr1zDKrpodB5EgSaTunpRkN5rgro
FUSIONAUTH_TENANT_ID=b1df6d92-e242-10ab-874d-6fe852a7a7fe
```

### **2. Test du bouton** :

1. **Connectez-vous** à votre application
2. **Cliquez** sur "FusionAuth Test" dans la bannière
3. **Vérifiez** que le JWT est généré
4. **Redirection** vers Stable Diffusion avec le token

### **3. Flux d'authentification** :

```javascript
// 1. Utilisateur clique sur le bouton
// 2. API génère un JWT
const jwt = generateJWT({
  iss: 'iahome.regispailler.fr',
  aud: 'stablediffusion.regispailler.fr',
  sub: userId,
  email: userEmail,
  module: 'stablediffusion'
});

// 3. Redirection avec JWT
const authUrl = `https://stablediffusion.regispailler.fr?jwt=${jwt}`;
window.open(authUrl, '_blank');
```

## 🛠️ Configuration côté serveur (Stable Diffusion)

### **1. Middleware Python** :

```python
# middleware.py
import jwt
from functools import wraps
from flask import request, jsonify

JWT_SECRET = 'votre-cle-secrete-jwt-super-securisee'  # Même clé que côté client

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
                JWT_SECRET,
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

### **2. Utilisation dans les routes** :

```python
@app.route('/')
@verify_jwt_token
def index():
    user = request.user
    print(f"Utilisateur connecté: {user['email']}")
    print(f"Module: {user['module']}")
    return render_template('index.html', user=user)
```

## 🔒 Sécurité

### **1. Validation des tokens** :
- ✅ **Signature** : HMAC-SHA256
- ✅ **Expiration** : 1 heure par défaut
- ✅ **Émetteur** : `iahome.regispailler.fr`
- ✅ **Audience** : `stablediffusion.regispailler.fr`

### **2. Informations dans le JWT** :
```json
{
  "iss": "iahome.regispailler.fr",
  "aud": "stablediffusion.regispailler.fr",
  "sub": "user-id",
  "email": "user@example.com",
  "module": "stablediffusion",
  "source": "iahome",
  "iat": 1640995200,
  "exp": 1640998800,
  "fusionauth": {
    "applicationId": "a3bd1666-71cd-4037-8037-322126502010",
    "tenantId": "b1df6d92-e242-10ab-874d-6fe852a7a7fe"
  }
}
```

## 🧪 Test

### **1. Test manuel** :

```bash
# Générer un JWT de test
node test-jwt-simple.js
```

### **2. Test via interface** :
1. Connectez-vous à votre application
2. Cliquez sur "FusionAuth Test"
3. Vérifiez les logs dans la console

### **3. Vérification JWT** :
- Allez sur [jwt.io](https://jwt.io/)
- Collez le JWT généré
- Vérifiez le payload

## 📋 Avantages de cette approche

1. ✅ **Pas de licence requise** : Fonctionne sans licence FusionAuth
2. ✅ **Contrôle total** : Vous gérez la génération et validation
3. ✅ **Sécurité** : HMAC-SHA256 pour la signature
4. ✅ **Compatibilité** : Informations FusionAuth intégrées
5. ✅ **Flexibilité** : Facile à modifier et étendre

## 🔧 Personnalisation

### **Modifier la durée d'expiration** :
```typescript
// Dans /api/fusionauth-token/route.ts
exp: Math.floor(Date.now() / 1000) + 7200, // 2 heures au lieu de 1
```

### **Ajouter des permissions** :
```typescript
const payload = {
  // ... autres champs
  permissions: ['read', 'write', 'admin'],
  role: 'user'
};
```

### **Changer l'algorithme** :
```typescript
const header = {
  alg: 'HS512', // Au lieu de HS256
  typ: 'JWT'
};
```

## 🚨 Important

1. **Changez la clé secrète** en production
2. **Gardez la clé secrète** confidentielle
3. **Utilisez HTTPS** en production
4. **Surveillez les logs** pour détecter les abus

Cette solution vous donne une authentification JWT complète sans licence FusionAuth ! 🎉 