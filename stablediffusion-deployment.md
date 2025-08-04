# 🎨 Déploiement de Stable Diffusion avec JWT

## 📋 **Vue d'ensemble**

Ce guide explique comment déployer Stable Diffusion avec authentification JWT sur votre serveur Windows, similaire à Metube.

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Serveur Windows                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Nginx     │  │   JWT Auth  │  │  Stable     │         │
│  │  (Reverse   │  │   Script    │  │ Diffusion   │         │
│  │   Proxy)    │  │             │  │  (Gradio)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          │                                 │
│  Port 80 (HTTPS)         │                                 │
│  stablediffusion.regispailler.fr                          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Étapes de déploiement**

### **1. Préparation de l'environnement**

```bash
# Créer le dossier de déploiement
mkdir C:\docker\stablediffusion
cd C:\docker\stablediffusion

# Créer les sous-dossiers
mkdir models
mkdir outputs
mkdir inputs
mkdir logs
```

### **2. Fichiers de configuration**

#### **2.1 Copier les fichiers**
- `stablediffusion-jwt-auth.py` → `C:\docker\stablediffusion\`
- `docker-compose-stablediffusion.yml` → `C:\docker\stablediffusion\`
- `nginx-stablediffusion.conf` → `C:\docker\stablediffusion\`

#### **2.2 Variables d'environnement**
```bash
# .env
JWT_SECRET=iahome-super-secret-jwt-key-2025-change-this-in-production
STABLEDIFFUSION_PORT=7860
AUTH_REQUIRED=true
LOG_LEVEL=INFO
```

### **3. Configuration DNS**

#### **3.1 Point DNS**
```
stablediffusion.regispailler.fr → Votre_IP_Serveur
```

#### **3.2 Certificat SSL**
```bash
# Avec Certbot
certbot --nginx -d stablediffusion.regispailler.fr
```

### **4. Démarrage des services**

```bash
# Démarrer les conteneurs
docker-compose -f docker-compose-stablediffusion.yml up -d

# Vérifier les logs
docker-compose -f docker-compose-stablediffusion.yml logs -f
```

### **5. Configuration Nginx principal**

Ajouter dans votre configuration Nginx principale :

```nginx
# Redirection vers le conteneur Stable Diffusion
server {
    listen 80;
    server_name stablediffusion.regispailler.fr;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 **Configuration de l'application principale**

### **1. Modification du code**

L'application principale a été modifiée pour :
- ✅ Générer des tokens JWT pour Stable Diffusion
- ✅ Rediriger vers `https://stablediffusion.regispailler.fr?token=...`
- ✅ Afficher le bouton "Test JWT" pour Stable Diffusion

### **2. API de génération de tokens**

L'API `/api/generate-access-token` supporte maintenant :
- ✅ `moduleName: 'stablediffusion'`
- ✅ Durée de token configurable
- ✅ Validation des permissions utilisateur

## 🔐 **Sécurité**

### **1. Authentification JWT**
- ✅ Validation des tokens côté serveur
- ✅ Expiration automatique des tokens
- ✅ Vérification du module autorisé

### **2. Proxy sécurisé**
- ✅ Headers de sécurité Nginx
- ✅ Protection contre les attaques courantes
- ✅ Logs d'accès détaillés

### **3. Isolation des conteneurs**
- ✅ Réseau Docker isolé
- ✅ Volumes persistants sécurisés
- ✅ Health checks automatiques

## 📊 **Monitoring**

### **1. Logs**
```bash
# Logs du script JWT
tail -f logs/stablediffusion-jwt-auth.log

# Logs Nginx
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log

# Logs Docker
docker-compose -f docker-compose-stablediffusion.yml logs -f
```

### **2. Health Check**
```bash
# Vérifier l'état des services
curl http://localhost:8080/health

# Vérifier Stable Diffusion
curl http://localhost:7860
```

## 🚨 **Dépannage**

### **1. Problèmes courants**

#### **Token JWT invalide**
```bash
# Vérifier la clé secrète
echo $JWT_SECRET

# Vérifier les logs
tail -f logs/stablediffusion-jwt-auth.log
```

#### **Stable Diffusion inaccessible**
```bash
# Vérifier le conteneur
docker ps | grep stablediffusion

# Redémarrer le service
docker-compose -f docker-compose-stablediffusion.yml restart
```

#### **Problèmes de réseau**
```bash
# Vérifier les ports
netstat -an | findstr :7860
netstat -an | findstr :8080

# Tester la connectivité
curl http://localhost:7860
```

### **2. Commandes utiles**

```bash
# Redémarrer tous les services
docker-compose -f docker-compose-stablediffusion.yml down
docker-compose -f docker-compose-stablediffusion.yml up -d

# Mettre à jour les images
docker-compose -f docker-compose-stablediffusion.yml pull
docker-compose -f docker-compose-stablediffusion.yml up -d

# Sauvegarder les données
docker run --rm -v stablediffusion_models:/data -v $(pwd):/backup alpine tar czf /backup/stablediffusion-models.tar.gz -C /data .
```

## 📈 **Performance**

### **1. Optimisations recommandées**
- ✅ Utiliser un GPU si disponible
- ✅ Configurer la mémoire Docker
- ✅ Optimiser les modèles Stable Diffusion
- ✅ Mettre en cache les images générées

### **2. Ressources requises**
- **CPU** : 4+ cœurs
- **RAM** : 8GB+ (16GB recommandé)
- **GPU** : NVIDIA avec 8GB+ VRAM (optionnel mais recommandé)
- **Stockage** : 50GB+ pour les modèles

## 🔄 **Mise à jour**

### **1. Mise à jour de l'application**
```bash
# Arrêter les services
docker-compose -f docker-compose-stablediffusion.yml down

# Mettre à jour les images
docker-compose -f docker-compose-stablediffusion.yml pull

# Redémarrer
docker-compose -f docker-compose-stablediffusion.yml up -d
```

### **2. Sauvegarde avant mise à jour**
```bash
# Sauvegarder les modèles
docker run --rm -v stablediffusion_models:/data -v $(pwd):/backup alpine tar czf /backup/stablediffusion-backup-$(date +%Y%m%d).tar.gz -C /data .
```

## ✅ **Validation du déploiement**

### **1. Tests à effectuer**
- ✅ Accès via l'application principale
- ✅ Génération de tokens JWT
- ✅ Validation des tokens côté serveur
- ✅ Génération d'images avec Stable Diffusion
- ✅ Gestion des erreurs et timeouts

### **2. URLs de test**
- `https://stablediffusion.regispailler.fr` (sans token → page de connexion)
- `https://stablediffusion.regispailler.fr?token=VALID_TOKEN` (avec token → Stable Diffusion)
- `http://localhost:8080/health` (health check)

## 🎯 **Résultat attendu**

Après le déploiement, les utilisateurs pourront :
1. Se connecter à l'application principale
2. Cliquer sur "Stable Diffusion"
3. Obtenir un token JWT automatiquement
4. Accéder à Stable Diffusion via `https://stablediffusion.regispailler.fr?token=...`
5. Générer des images avec l'interface Gradio sécurisée 