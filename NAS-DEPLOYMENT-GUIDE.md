# 🌐 Guide de déploiement iahome.fr sur NAS Nuxit

## 📋 Prérequis

- **NAS Nuxit** avec Docker installé
- **Domaine iahome.fr** configuré chez Nuxit
- **Accès SSH** à votre NAS
- **IP publique fixe** ou DDNS configuré

## 🔧 Configuration DNS chez Nuxit

### 1. Connectez-vous à votre espace client Nuxit
- Allez sur [nuxit.com](https://nuxit.com)
- Connectez-vous à votre espace client

### 2. Gestion DNS du domaine iahome.fr
- Trouvez votre domaine `iahome.fr`
- Cliquez sur "Gestion DNS"

### 3. Ajoutez les enregistrements DNS

```dns
# Enregistrement principal
Type: A
Nom: @
Valeur: [VOTRE_IP_PUBLIQUE_NAS]
TTL: 300

# Redirection www
Type: CNAME
Nom: www
Valeur: iahome.fr
TTL: 300

# Sous-domaines pour services
Type: A
Nom: stablediffusion
Valeur: [VOTRE_IP_PUBLIQUE_NAS]
TTL: 300

Type: A
Nom: api
Valeur: [VOTRE_IP_PUBLIQUE_NAS]
TTL: 300

Type: A
Nom: traefik
Valeur: [VOTRE_IP_PUBLIQUE_NAS]
TTL: 300
```

## 🐳 Configuration du NAS

### 1. Installation Docker (si pas déjà fait)

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Docker
sudo apt install docker.io docker-compose -y

# Démarrage et activation de Docker
sudo systemctl enable docker
sudo systemctl start docker

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
```

### 2. Configuration du routeur

**Ports à ouvrir :**
- **Port 80** → NAS (HTTP pour Let's Encrypt)
- **Port 443** → NAS (HTTPS)
- **Port 3000** → NAS (Application)

### 3. Vérification de l'IP publique

```bash
# Vérifiez votre IP publique
curl ifconfig.me

# Notez cette IP pour la configuration DNS
```

## 🚀 Déploiement

### 1. Transfert des fichiers

```bash
# Créez un dossier pour le projet
mkdir -p ~/iahome-nas
cd ~/iahome-nas

# Transférez tous les fichiers du projet
# (utilisez scp, rsync ou un client SFTP)
```

### 2. Configuration des variables d'environnement

```bash
# Modifiez le fichier env.production.nas
nano env.production.nas

# Remplacez les valeurs suivantes :
# - STRIPE_SECRET_KEY=sk_live_votre_cle_stripe
# - RESEND_API_KEY=re_votre_cle_resend
# - OPENAI_API_KEY=sk-votre_cle_openai
# - JWT_SECRET=votre_secret_jwt_securise
# - NEXTAUTH_SECRET=votre_secret_nextauth_securise
```

### 3. Exécution du script de déploiement

```bash
# Rendez le script exécutable
chmod +x deploy-nas.sh

# Exécutez le script
./deploy-nas.sh
```

## 🔒 Sécurité

### 1. Protection du dashboard Traefik

```bash
# Générez un mot de passe hashé pour Traefik
htpasswd -nb admin votre_mot_de_passe

# Remplacez dans traefik-nas.yml :
# admin:$2y$10$hashed_password_here
```

### 2. Firewall

```bash
# Installation d'ufw
sudo apt install ufw

# Configuration du firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📊 Monitoring

### 1. Dashboard Traefik
- **URL** : https://traefik.iahome.fr
- **Identifiants** : admin / votre_mot_de_passe

### 2. Logs des services

```bash
# Logs Traefik
docker logs traefik-nas

# Logs application
docker logs iahome-app-nas

# Logs en temps réel
docker logs -f traefik-nas
```

## 🔄 Maintenance

### 1. Mise à jour de l'application

```bash
# Arrêt des services
docker-compose -f traefik/traefik-nas.yml down

# Reconstruction de l'image
docker build -t iahome-iahome-app:latest .

# Redémarrage
docker-compose -f traefik/traefik-nas.yml up -d
```

### 2. Sauvegarde des certificats

```bash
# Sauvegarde des certificats Let's Encrypt
tar -czf letsencrypt-backup-$(date +%Y%m%d).tar.gz traefik/letsencrypt/
```

### 3. Renouvellement automatique

Les certificats Let's Encrypt se renouvellent automatiquement grâce à Traefik.

## 🚨 Dépannage

### Problème : Certificat SSL non généré
```bash
# Vérifiez les logs Traefik
docker logs traefik-nas | grep -i acme

# Vérifiez que le port 80 est accessible
curl -I http://iahome.fr
```

### Problème : Application non accessible
```bash
# Vérifiez le statut des conteneurs
docker ps

# Vérifiez les logs de l'application
docker logs iahome-app-nas
```

### Problème : DNS non propagé
```bash
# Vérifiez la propagation DNS
nslookup iahome.fr
dig iahome.fr

# Attendez 24-48h pour la propagation complète
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker logs [nom_conteneur]`
2. Vérifiez le statut : `docker ps`
3. Vérifiez la connectivité : `curl -I https://iahome.fr`
4. Contactez le support Nuxit si problème DNS

## ✅ Checklist de déploiement

- [ ] DNS configuré chez Nuxit
- [ ] Ports 80/443 ouverts sur le routeur
- [ ] Docker installé sur le NAS
- [ ] Variables d'environnement configurées
- [ ] Script de déploiement exécuté
- [ ] Certificat SSL généré
- [ ] Application accessible sur https://iahome.fr
- [ ] Dashboard Traefik accessible
- [ ] Firewall configuré
- [ ] Sauvegarde des certificats

🎉 **Votre site iahome.fr est maintenant déployé sur votre NAS Nuxit avec SSL automatique !**



