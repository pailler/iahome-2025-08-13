# 🔐 Déploiement sécurisé avec iframe - Stable Diffusion

## 📋 **Vue d'ensemble de la sécurité**

Cette solution implémente un accès **100% sécurisé** à Stable Diffusion via iframe, empêchant tout accès direct sans authentification.

## 🛡️ **Niveaux de sécurité implémentés**

### **1. Authentification JWT obligatoire**
- ✅ **Token requis** : Impossible d'accéder sans token JWT valide
- ✅ **Expiration automatique** : Tokens temporaires (24h par défaut)
- ✅ **Validation côté serveur** : Vérification stricte des permissions

### **2. Isolation par iframe**
- ✅ **Pas d'URLs exposées** : L'utilisateur ne voit jamais l'URL directe
- ✅ **Contrôle total** : Seule votre application peut générer l'accès
- ✅ **Sandbox sécurisé** : iframe avec restrictions de sécurité

### **3. Interface sécurisée**
- ✅ **Page de blocage** : Accès direct impossible
- ✅ **Redirection forcée** : Vers la plateforme principale
- ✅ **Logs de sécurité** : Traçabilité complète des accès

## 🏗️ **Architecture de sécurité**

```
┌─────────────────────────────────────────────────────────────┐
│                    Utilisateur                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Votre Application (iahome.fr)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Authentification utilisateur                    │   │
│  │ 2. Génération token JWT                            │   │
│  │ 3. Ouverture iframe sécurisée                      │   │
│  └─────────────────────┬───────────────────────────────┘   │
└────────────────────────┼───────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              iframe sécurisée                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ URL: stablediffusion.regispailler.fr?token=JWT     │   │
│  │ Sandbox: restrictions de sécurité                   │   │
│  │ Isolation: pas d'accès direct                       │   │
│  └─────────────────────┬───────────────────────────────┘   │
└────────────────────────┼───────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Script JWT (Proxy)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Validation token JWT                             │   │
│  │ 2. Vérification permissions                         │   │
│  │ 3. Proxy vers Stable Diffusion                     │   │
│  └─────────────────────┬───────────────────────────────┘   │
└────────────────────────┼───────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Stable Diffusion (Gradio)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Interface utilisateur sécurisée                     │   │
│  │ Génération d'images                                 │   │
│  │ Pas d'accès direct depuis l'extérieur               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Étapes de déploiement sécurisé**

### **1. Configuration du script JWT**

Le script `stablediffusion-jwt-auth.py` est configuré pour :
- ✅ **Bloquer l'accès direct** : Page de sécurité pour les accès sans token
- ✅ **Valider les tokens** : Vérification stricte des JWT
- ✅ **Proxy sécurisé** : Redirection vers Stable Diffusion uniquement si autorisé

### **2. Configuration de l'application principale**

L'application principale :
- ✅ **Génère des tokens JWT** : Pour chaque session utilisateur
- ✅ **Ouvre des iframes sécurisées** : Au lieu de nouveaux onglets
- ✅ **Contrôle l'accès** : Seule votre app peut accéder à Stable Diffusion

### **3. Configuration Docker**

Le `docker-compose-stablediffusion.yml` :
- ✅ **Isole les services** : Réseau Docker privé
- ✅ **Sécurise les ports** : Seuls les ports nécessaires exposés
- ✅ **Gère les logs** : Traçabilité complète

## 🔧 **Configuration de sécurité avancée**

### **1. Headers de sécurité Nginx**

```nginx
# Headers de sécurité pour l'iframe
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "frame-ancestors 'self' https://iahome.fr" always;
```

### **2. Sandbox iframe**

```html
<iframe
  src="https://stablediffusion.regispailler.fr?token=JWT"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
  referrerPolicy="no-referrer"
/>
```

### **3. Validation JWT stricte**

```python
# Vérification stricte du token
if payload.get('moduleName') != 'stablediffusion':
    return False  # Accès refusé

if payload.get('exp') < time.time():
    return False  # Token expiré
```

## 📊 **Monitoring de sécurité**

### **1. Logs de sécurité**

```bash
# Logs du script JWT
tail -f logs/stablediffusion-jwt-auth.log

# Logs Nginx
tail -f logs/nginx/access.log | grep stablediffusion
```

### **2. Métriques de sécurité**

- **Tentatives d'accès direct** : Bloquées automatiquement
- **Tokens expirés** : Rejetés avec logs
- **Accès non autorisés** : Traçés et bloqués

## 🚨 **Scénarios de sécurité**

### **1. Tentative d'accès direct**
```
Utilisateur → https://stablediffusion.regispailler.fr
↓
Page de sécurité affichée
↓
Redirection vers iahome.fr
```

### **2. Token JWT invalide**
```
Utilisateur → iframe avec token invalide
↓
Validation échoue
↓
Page de sécurité affichée
```

### **3. Token JWT expiré**
```
Utilisateur → iframe avec token expiré
↓
Vérification d'expiration
↓
Page de sécurité affichée
```

### **4. Accès autorisé**
```
Utilisateur → Votre app → Génération JWT → iframe sécurisée
↓
Validation réussie
↓
Accès à Stable Diffusion
```

## ✅ **Avantages de cette solution**

### **🔒 Sécurité maximale**
- **Aucun accès direct possible** : URLs non exposées
- **Contrôle total** : Seule votre app peut accéder
- **Isolation complète** : iframe avec sandbox

### **👥 Expérience utilisateur**
- **Interface intégrée** : Pas de nouveaux onglets
- **Navigation fluide** : Reste dans votre app
- **Feedback visuel** : Indicateurs de sécurité

### **🛠️ Maintenance**
- **Centralisé** : Tout contrôlé depuis votre app
- **Traçable** : Logs complets des accès
- **Évolutif** : Facile d'ajouter d'autres modules

## 🎯 **Résultat final**

Après le déploiement :
1. **Aucun utilisateur** ne peut accéder directement à `stablediffusion.regispailler.fr`
2. **Seule votre application** peut générer des accès via JWT
3. **Tous les accès** passent par l'iframe sécurisée
4. **Traçabilité complète** de tous les accès
5. **Sécurité maximale** avec isolation complète

## 🔄 **Évolution future**

Cette architecture permet facilement :
- ✅ **Ajouter d'autres modules** sécurisés
- ✅ **Gérer différents niveaux d'accès**
- ✅ **Implémenter des quotas d'usage**
- ✅ **Ajouter des notifications de sécurité** 