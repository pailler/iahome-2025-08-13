# Guide de Démarrage Rapide - Protection d'Accès StableDiffusion

## 🚀 Solutions Disponibles

### 1. **Protection par IP (Recommandée)**
La solution la plus simple et efficace pour un usage privé.

### 2. **Protection par Clé API**
Alternative moderne qui remplace la protection par mot de passe.

### 3. **Limitation de Connexions**
Protection contre la surcharge et les attaques basiques.

---

## 🔧 Installation Rapide

### Option A: Protection par IP avec Script Automatique

```bash
# 1. Exécuter le script de configuration
node setup-ip-protection.js

# 2. Suivre les instructions interactives
# 3. Modifier docker-compose.yml avec votre image StableDiffusion
# 4. Lancer la protection
cd stablediffusion-ip-protection
./start-stablediffusion.sh
```

### Option B: Protection par Clé API

```bash
# 1. Installer les dépendances
pip install gradio

# 2. Lancer la protection par clé API
python gradio-api-protection.py

# 3. Accéder à http://localhost:7860
# 4. Utiliser l'onglet "Administration" pour créer des clés
```

### Option C: Configuration Manuelle Nginx

```bash
# 1. Copier le contenu de nginx.conf dans votre configuration
# 2. Ajuster les IPs autorisées
# 3. Configurer les certificats SSL
# 4. Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 📋 Configuration Recommandée

### Pour Usage Local/Réseau Privé
```yaml
# IPs autorisées
allowedIPs:
  - 192.168.1.0/24    # Réseau local
  - 10.0.0.0/8        # Réseau privé
  - 127.0.0.1/32      # Localhost

# Limitation de connexions
rateLimit:
  average: 5          # 5 connexions/seconde
  burst: 10           # Pic de 10 connexions
```

### Pour Usage Professionnel
```yaml
# Protection renforcée
allowedIPs:
  - 203.0.113.1/32    # IP spécifique
  - 198.51.100.0/24   # Réseau d'entreprise

# Limitation stricte
rateLimit:
  average: 2          # 2 connexions/seconde
  burst: 5            # Pic de 5 connexions
```

---

## 🧪 Test de la Protection

### Test de Connexion
```bash
# Test depuis une IP autorisée
curl -I https://stablediffusion.regispailler.fr

# Test depuis une IP non autorisée (doit retourner 403)
curl -I https://stablediffusion.regispailler.fr
```

### Test de Limitation
```bash
# Test de surcharge (doit être limité)
for i in {1..20}; do
  curl -s https://stablediffusion.regispailler.fr > /dev/null &
done
```

### Monitoring
```bash
# Lancer le script de monitoring
python monitor_stablediffusion.py

# Vérifier les logs
tail -f stablediffusion_monitor.log
```

---

## 🔍 Dépannage

### Problème: Accès refusé depuis IP autorisée
```bash
# Vérifier la configuration IP
docker-compose logs traefik

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### Problème: Limitation trop stricte
```yaml
# Ajuster les limites dans docker-compose.yml
- "traefik.http.middlewares.ratelimit.ratelimit.average=10"
- "traefik.http.middlewares.ratelimit.ratelimit.burst=20"
```

### Problème: Certificats SSL
```bash
# Vérifier les certificats Let's Encrypt
docker-compose logs traefik | grep "certificate"

# Régénérer les certificats
docker-compose restart traefik
```

---

## 📊 Monitoring et Logs

### Logs Traefik
```bash
# Suivre les logs en temps réel
docker-compose logs -f traefik

# Voir les accès
docker exec traefik cat /var/log/traefik/access.log
```

### Logs StableDiffusion
```bash
# Logs de l'application
docker-compose logs -f stablediffusion

# Logs de monitoring
tail -f stablediffusion_monitor.log
```

### Dashboard Traefik
- URL: `https://traefik.stablediffusion.regispailler.fr`
- Affiche les services, middlewares et métriques

---

## 🔐 Sécurité Avancée

### Protection par Heure
```python
# Ajouter dans votre script de lancement
import datetime

def check_time_access():
    now = datetime.datetime.now()
    # Autoriser seulement entre 8h et 22h
    if now.hour < 8 or now.hour >= 22:
        return False
    return True
```

### Protection par Géolocalisation
```nginx
# Bloquer les pays non autorisés
geo $blocked_country {
    default 0;
    RU 1;  # Russie
    CN 1;  # Chine
}
```

### Monitoring Avancé
```python
# Alertes par email en cas de problème
import smtplib
from email.mime.text import MIMEText

def send_alert(message):
    # Configuration email
    msg = MIMEText(message)
    msg['Subject'] = 'Alerte StableDiffusion'
    msg['From'] = 'admin@example.com'
    msg['To'] = 'admin@example.com'
    
    # Envoi
    with smtplib.SMTP('smtp.example.com', 587) as server:
        server.starttls()
        server.login('user', 'password')
        server.send_message(msg)
```

---

## 🎯 Recommandations Finales

### Pour Usage Personnel
1. **Protection par IP** avec réseau local
2. **Limitation de connexions** basique
3. **Monitoring simple** avec logs

### Pour Usage Professionnel
1. **Protection par IP** stricte
2. **Limitation de connexions** renforcée
3. **Monitoring avancé** avec alertes
4. **Protection par heure** si nécessaire

### Pour Usage Public (Non recommandé)
1. **Protection par clé API** obligatoire
2. **Limitation stricte** des connexions
3. **Monitoring complet** avec alertes
4. **Protection par géolocalisation**

---

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans les sections ci-dessus
2. Testez la connectivité réseau
3. Vérifiez la configuration des IPs autorisées
4. Consultez la documentation complète dans `ACCESS-CONTROL-ALTERNATIVES.md`

**Note**: Ces solutions remplacent efficacement la protection par mot de passe tout en offrant une sécurité adaptée à vos besoins. 