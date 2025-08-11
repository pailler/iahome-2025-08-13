# 🚀 Guide de Démarrage Rapide - Migration vers iahome.fr

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- [ ] **Serveur Linux** avec Docker et Docker Compose installés
- [ ] **Domaine iahome.fr** configuré et pointant vers votre serveur
- [ ] **Clés Supabase** de production
- [ ] **Clés Stripe** de production
- [ **Clé Resend** de production
- [ ] **Accès SSH** au serveur

## 🎯 Étapes Rapides

### **Étape 1 : Préparation (5 minutes)**

```bash
# 1. Rendre les scripts exécutables
chmod +x scripts/migrate-step1.sh
chmod +x scripts/migrate-step2.sh

# 2. Lancer l'étape 1
./scripts/migrate-step1.sh
```

**Résultat attendu :**
- ✅ Prérequis vérifiés
- ✅ Structure du projet validée
- ✅ Sauvegarde créée

### **Étape 2 : Infrastructure (10 minutes)**

```bash
# 1. Lancer l'étape 2
./scripts/migrate-step2.sh
```

**Informations à préparer :**
- IP du serveur de production
- URL Supabase de production
- Clé anon Supabase de production
- Clé service_role Supabase de production
- Clé secrète Stripe de production
- Clé publique Stripe de production
- Clé API Resend de production

**Résultat attendu :**
- ✅ Variables d'environnement configurées
- ✅ Docker Compose production créé
- ✅ Nginx configuré
- ✅ Scripts de déploiement créés

### **Étape 3 : Configuration DNS (5 minutes)**

Dans votre panneau DNS, configurez :

```
Type: A
Nom: @ (ou iahome.fr)
Valeur: [IP_DE_VOTRE_SERVEUR]

Type: A
Nom: www
Valeur: [IP_DE_VOTRE_SERVEUR]
```

### **Étape 4 : Déploiement (10 minutes)**

```bash
# 1. Déployer en production
./scripts/deploy-production.sh

# 2. Vérifier le statut
docker-compose -f docker-compose.prod.yml ps

# 3. Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Configuration Rapide

### **Variables d'environnement manquantes**

Après l'étape 2, éditez `.env.production` et ajoutez :

```env
# Remplacez ces valeurs par vos vraies clés
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
OPENAI_API_KEY=sk-votre_openai_key
STABLE_DIFFUSION_API_KEY=votre_sd_key
JWT_SECRET=votre_jwt_secret_tres_long_et_complexe
NEXTAUTH_SECRET=votre_nextauth_secret_tres_long_et_complexe
```

### **Test rapide**

```bash
# Test de l'application
curl -f http://localhost:3000/api/health

# Test de Nginx
curl -I http://localhost:80

# Test de Traefik
curl -I http://localhost:8080
```

## 🚨 Dépannage Rapide

### **Problème : Application non accessible**

```bash
# 1. Vérifier les conteneurs
docker-compose -f docker-compose.prod.yml ps

# 2. Vérifier les logs
docker-compose -f docker-compose.prod.yml logs iahome-app

# 3. Redémarrer
docker-compose -f docker-compose.prod.yml restart
```

### **Problème : SSL non fonctionnel**

```bash
# 1. Vérifier Traefik
docker-compose -f docker-compose.prod.yml logs traefik

# 2. Vérifier les certificats
ls -la traefik/letsencrypt/

# 3. Redémarrer Traefik
docker-compose -f docker-compose.prod.yml restart traefik
```

### **Problème : Base de données**

```bash
# 1. Vérifier la connectivité Supabase
curl -f $NEXT_PUBLIC_SUPABASE_URL/rest/v1/

# 2. Vérifier les variables d'environnement
docker exec iahome-app env | grep SUPABASE
```

## 📊 Monitoring Rapide

### **Statut des services**

```bash
# Dashboard Traefik
http://votre-ip:8080

# Logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f

# Métriques système
docker stats
```

### **Sauvegarde rapide**

```bash
# Sauvegarder la configuration
cp .env.production backups/
cp docker-compose.prod.yml backups/

# Sauvegarder les données (si nécessaire)
docker exec iahome-app pg_dump > backups/database.sql
```

## 🎉 Validation Finale

### **Tests à effectuer**

1. **Application :** https://iahome.fr
2. **SSL :** https://www.iahome.fr
3. **API :** https://iahome.fr/api/health
4. **Authentification :** https://iahome.fr/login
5. **Admin :** https://iahome.fr/admin

### **Checklist finale**

- [ ] Site accessible en HTTPS
- [ ] Redirection HTTP → HTTPS fonctionnelle
- [ ] Authentification fonctionnelle
- [ ] Admin accessible
- [ ] API fonctionnelle
- [ ] Logs générés
- [ ] SSL valide

## 📞 Support

### **En cas de problème**

1. **Logs :** `docker-compose -f docker-compose.prod.yml logs`
2. **Statut :** `docker-compose -f docker-compose.prod.yml ps`
3. **Rollback :** `./scripts/rollback.sh`
4. **Documentation :** `MIGRATION-GUIDE.md`

### **Commandes utiles**

```bash
# Redémarrer tout
docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d

# Nettoyer
docker system prune -f

# Mettre à jour
git pull && ./scripts/deploy-production.sh
```

---

**🎯 Objectif :** Migration complète en moins de 30 minutes !

**📈 Succès :** Site accessible sur https://iahome.fr avec SSL et toutes les fonctionnalités opérationnelles. 