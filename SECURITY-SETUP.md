# 🔒 Configuration de Sécurité Traefik pour iahome.fr

Ce document décrit la configuration de sécurité complète mise en place pour sécuriser iahome.fr avec Traefik.

## 📋 Vue d'ensemble

La configuration utilise Traefik v2.10 comme reverse proxy avec les fonctionnalités de sécurité suivantes :

- ✅ **SSL/TLS automatique** avec Let's Encrypt (DNS challenge)
- ✅ **Redirections HTTP → HTTPS** et www → apex
- ✅ **En-têtes de sécurité** (HSTS, CSP, X-Frame-Options, etc.)
- ✅ **Rate limiting** pour l'API et l'authentification
- ✅ **Protection contre les attaques par force brute**
- ✅ **Compression et cache** pour les performances
- ✅ **Monitoring et logs** détaillés

## 🏗️ Architecture

```
Internet → Traefik (80/443) → iahome-app (3000)
                ↓
        Let's Encrypt (DNS)
                ↓
        Logs + Monitoring
```

## 📁 Structure des fichiers

```
traefik/
├── dynamic/
│   ├── iahome-secure.yml      # Configuration principale sécurisée
│   ├── tls-options.yml        # Options TLS sécurisées
│   └── ruinedfooocus.yml      # Configuration RuinedFooocus
├── letsencrypt/
│   ├── acme.json              # Certificats Let's Encrypt
│   └── acme-dns.json          # Configuration DNS challenge
└── logs/                      # Logs Traefik

scripts/
├── security-check.ps1         # Vérification de sécurité (Windows)
├── security-check.sh          # Vérification de sécurité (Linux)
└── deploy-secure.ps1          # Script de déploiement sécurisé
```

## 🔧 Configuration détaillée

### 1. En-têtes de sécurité

```yaml
security-headers:
  headers:
    customResponseHeaders:
      Strict-Transport-Security: "max-age=31536000; includeSubDomains; preload"
      X-Content-Type-Options: "nosniff"
      X-Frame-Options: "DENY"
      X-XSS-Protection: "1; mode=block"
      Referrer-Policy: "strict-origin-when-cross-origin"
      Permissions-Policy: "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
      Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://*.supabase.co https://www.google-analytics.com; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self';"
```

### 2. Rate Limiting

- **API**: 10 req/s avec burst de 20
- **Authentification**: 1 req/min avec burst de 5
- **Protection force brute**: 1 req/min avec burst de 3

### 3. Configuration TLS

- **TLS 1.2+** obligatoire
- **Cipher suites** sécurisés (ECDHE + AES-GCM + ChaCha20)
- **SNI strict** activé
- **ALPN** pour HTTP/2

## 🚀 Déploiement

### Prérequis

1. **Docker** et **Docker Compose** installés
2. **DNS** configuré pour pointer vers votre serveur
3. **Variables d'environnement** configurées (`.env.production`)

### Déploiement automatique

```powershell
# Déploiement standard
.\scripts\deploy-secure.ps1

# Déploiement avec nettoyage forcé
.\scripts\deploy-secure.ps1 -Force

# Déploiement sans vérification de santé
.\scripts\deploy-secure.ps1 -SkipHealthCheck
```

### Déploiement manuel

```bash
# 1. Arrêter les conteneurs existants
docker-compose -f docker-compose.prod.yml down

# 2. Construire et démarrer
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Vérifier les logs
docker logs iahome-traefik
docker logs iahome-app
```

## 🔍 Vérification de sécurité

### Script automatique

```powershell
# Windows
.\scripts\security-check.ps1

# Linux
./scripts/security-check.sh
```

### Vérifications manuelles

1. **Redirection HTTP → HTTPS**
   ```bash
   curl -I http://iahome.fr
   # Doit retourner 301 ou 302
   ```

2. **Certificat SSL**
   ```bash
   openssl s_client -servername iahome.fr -connect iahome.fr:443
   ```

3. **En-têtes de sécurité**
   ```bash
   curl -I https://iahome.fr
   ```

4. **Endpoint de santé**
   ```bash
   curl https://iahome.fr/api/health
   ```

## 📊 Monitoring

### Logs Traefik

```bash
# Logs en temps réel
docker logs -f iahome-traefik

# Logs d'accès
tail -f logs/traefik/access.log

# Logs d'erreur
tail -f logs/traefik/error.log
```

### Dashboard Traefik

- **URL**: http://localhost:8080
- **Fonctionnalités**: Routers, services, middlewares, certificats

### Métriques de santé

- **Endpoint**: https://iahome.fr/api/health
- **Informations**: Status, uptime, services, mémoire

## 🛡️ Sécurité avancée

### Protection contre les attaques

1. **Rate limiting** par type de route
2. **IP whitelisting** pour les routes sensibles
3. **Headers de sécurité** complets
4. **TLS 1.2+** obligatoire

### Monitoring des tentatives d'attaque

```bash
# Chercher les tentatives de force brute
grep "login\|register\|auth" logs/traefik/access.log | grep "429"

# Chercher les accès non autorisés
grep "403\|401" logs/traefik/access.log

# Chercher les tentatives d'injection
grep -i "union\|select\|script\|javascript" logs/traefik/access.log
```

## 🔧 Dépannage

### Problèmes courants

1. **Certificats non générés**
   ```bash
   # Vérifier la configuration DNS
   nslookup iahome.fr
   
   # Vérifier les logs Traefik
   docker logs iahome-traefik | grep -i "acme\|certificate"
   ```

2. **Redirections non fonctionnelles**
   ```bash
   # Vérifier la configuration des middlewares
   docker exec iahome-traefik traefik version
   ```

3. **Rate limiting trop strict**
   ```yaml
   # Ajuster dans iahome-secure.yml
   api-rate-limit:
     rateLimit:
       burst: 50    # Augmenter
       average: 20  # Augmenter
   ```

### Commandes utiles

```bash
# Redémarrer Traefik
docker-compose -f docker-compose.prod.yml restart iahome-traefik

# Vérifier la configuration
docker exec iahome-traefik traefik version

# Nettoyer les certificats
rm -rf traefik/letsencrypt/acme.json

# Vérifier les ports
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

## 📈 Performance

### Optimisations activées

- **Compression gzip** pour tous les contenus
- **Cache** pour les assets statiques (1 an)
- **Cache** pour les pages (1 heure)
- **HTTP/2** activé
- **Keep-alive** configuré

### Monitoring des performances

```bash
# Vérifier l'utilisation mémoire
docker stats iahome-traefik iahome-app

# Vérifier les logs de performance
grep "response_time" logs/traefik/access.log
```

## 🔄 Maintenance

### Renouvellement des certificats

Les certificats Let's Encrypt se renouvellent automatiquement tous les 60 jours.

### Mise à jour de la configuration

1. Modifier les fichiers dans `traefik/dynamic/`
2. Redémarrer Traefik : `docker-compose restart iahome-traefik`
3. Vérifier les logs pour s'assurer qu'il n'y a pas d'erreurs

### Sauvegarde

```bash
# Sauvegarder la configuration
tar -czf traefik-backup-$(date +%Y%m%d).tar.gz traefik/

# Sauvegarder les certificats
cp -r traefik/letsencrypt/ backup/letsencrypt-$(date +%Y%m%d)/
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs : `docker logs iahome-traefik`
2. Testez la configuration : `.\scripts\security-check.ps1`
3. Consultez la documentation Traefik : https://doc.traefik.io/
4. Vérifiez les outils en ligne :
   - https://www.ssllabs.com/ssltest/analyze.html?d=iahome.fr
   - https://securityheaders.com/?q=iahome.fr
   - https://observatory.mozilla.org/analyze/iahome.fr

---

**Dernière mise à jour** : $(date)
**Version** : 1.0.0
**Traefik** : v2.10










