# 🔐 Guide : Proxy Stable Diffusion sans modification

## 📋 Vue d'ensemble

Cette solution permet d'accéder à Stable Diffusion **sans modifier l'application** en utilisant un **proxy intelligent** qui :

1. ✅ **Vérifie le JWT** côté serveur
2. ✅ **Injecte automatiquement** les credentials HTTP Basic
3. ✅ **Transmet le contenu** authentifié via iframe
4. ✅ **Garde l'interface** Stable Diffusion intacte

## 🏗️ Architecture

```
Utilisateur → IAHome → Proxy JWT → Stable Diffusion
     ↓           ↓         ↓            ↓
   Connecté   Génère    Vérifie    Reçoit requête
   (Supabase)   JWT      JWT      authentifiée
```

## 🔧 Composants

### 1. **API Proxy** (`/api/proxy-stablediffusion`)
- **Fichier** : `src/app/api/proxy-stablediffusion/route.ts`
- **Fonction** : Intercepte les requêtes et injecte l'authentification
- **Méthodes** : GET, POST

### 2. **Page Client** (`/stablediffusion-proxy`)
- **Fichier** : `src/app/stablediffusion-proxy/page.tsx`
- **Fonction** : Interface utilisateur avec iframe
- **Authentification** : Vérification session + génération JWT

### 3. **Bouton FusionAuth**
- **Localisation** : Bannière principale
- **Action** : Redirection vers `/stablediffusion-proxy`

## 🚀 Utilisation

### **Étape 1 : Cliquer sur le bouton**
```
🔐 FusionAuth Test → Génération JWT → Redirection automatique
```

### **Étape 2 : Page proxy**
```
✅ Vérification session
✅ Génération JWT
✅ Création iframe avec proxy
✅ Affichage Stable Diffusion
```

### **Étape 3 : Utilisation normale**
```
🎨 Interface Stable Diffusion complète
🔐 Authentification automatique
⚡ Pas de demande de mot de passe
```

## 🔍 Fonctionnement technique

### **1. Vérification JWT**
```typescript
function verifyJWT(token: string) {
  // Décodage et vérification signature
  // Vérification expiration
  // Vérification issuer/audience
  return payload;
}
```

### **2. Injection credentials**
```typescript
const credentials = Buffer.from('admin:Rasulova75').toString('base64');
headers.set('Authorization', `Basic ${credentials}`);
```

### **3. Proxy de contenu**
```typescript
const response = await fetch(targetUrl, {
  method: 'GET',
  headers: headers,
});
return new NextResponse(content, { headers });
```

## 🛡️ Sécurité

### **Avantages**
- ✅ **JWT vérifié** côté serveur
- ✅ **Credentials sécurisés** (pas exposés côté client)
- ✅ **Expiration automatique** (1 heure)
- ✅ **Audience spécifique** (stablediffusion.regispailler.fr)
- ✅ **Pas de modification** de l'application cible

### **Protection**
- 🔒 **Signature HMAC-SHA256**
- 🔒 **Vérification issuer/audience**
- 🔒 **Expiration automatique**
- 🔒 **Headers sécurisés**

## 🧪 Test

### **1. Test du bouton**
```
1. Connectez-vous à IAHome
2. Cliquez sur "FusionAuth Test"
3. Vérifiez la redirection vers /stablediffusion-proxy
```

### **2. Test de l'interface**
```
1. Vérifiez l'affichage de Stable Diffusion
2. Testez les fonctionnalités (génération d'images)
3. Vérifiez l'absence de demande de mot de passe
```

### **3. Test de sécurité**
```
1. Ouvrez les DevTools
2. Vérifiez l'absence de credentials dans le code client
3. Vérifiez les headers de requête
```

## 🔧 Configuration

### **Variables d'environnement**
```env
JWT_SECRET=JaLJCLVQNxECK74pxZ7o5YQy1L/m7pC14OkPTRLmsE+R7QND4Hi1EXmv8gvkDNoxU1T2Dhx7xyLD3CWd0+mwfw==
```

### **URLs configurées**
```typescript
const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';
const STABLEDIFFUSION_CREDENTIALS = {
  username: 'admin',
  password: 'Rasulova75'
};
```

## 🐛 Dépannage

### **Erreur "Token JWT manquant"**
- Vérifiez la session utilisateur
- Vérifiez la génération du JWT

### **Erreur "Token JWT invalide"**
- Vérifiez la clé JWT_SECRET
- Vérifiez l'expiration du token

### **Erreur "Erreur Stable Diffusion"**
- Vérifiez l'accessibilité de stablediffusion.regispailler.fr
- Vérifiez les credentials

### **Iframe ne se charge pas**
- Vérifiez les permissions sandbox
- Vérifiez les headers CORS

## 📊 Logs de debug

### **Console client**
```
👤 Utilisateur connecté: user@example.com
🔐 JWT généré: Succès
🔗 URL iframe créée: /api/proxy-stablediffusion?jwt=...
```

### **Console serveur**
```
🔐 Proxy Stable Diffusion - JWT reçu: Oui
✅ JWT validé pour: user@example.com
🔗 Redirection vers: https://stablediffusion.regispailler.fr/
📡 Réponse Stable Diffusion: 200 OK
✅ Contenu récupéré, type: text/html
```

## 🎯 Avantages de cette solution

1. **🔒 Sécurisée** : JWT vérifié côté serveur
2. **🚀 Simple** : Pas de modification de l'application cible
3. **⚡ Rapide** : Authentification automatique
4. **🛡️ Robuste** : Gestion d'erreurs complète
5. **🔧 Maintenable** : Code modulaire et documenté

## 🚀 Prochaines étapes

1. **Tester** le bouton "FusionAuth Test"
2. **Vérifier** l'affichage de Stable Diffusion
3. **Tester** les fonctionnalités de génération
4. **Valider** l'absence de demande de mot de passe

---

**✅ Solution prête à l'emploi !** 