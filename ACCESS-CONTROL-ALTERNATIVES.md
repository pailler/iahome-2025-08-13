# Alternatives de Contrôle d'Accès pour StableDiffusion

## 1. Protection par IP (Recommandée)

### Configuration Nginx
```nginx
# Autoriser seulement certaines IPs
location / {
    allow 192.168.1.0/24;  # Réseau local
    allow 10.0.0.0/8;      # Réseau privé
    allow 203.0.113.1;     # IP spécifique
    deny all;              # Refuser tout le reste
}
```

### Configuration Traefik
```yaml
# docker-compose.yml
services:
  stablediffusion:
    labels:
      - "traefik.http.middlewares.ipwhitelist.ipwhitelist.sourcerange=192.168.1.0/24,10.0.0.0/8"
      - "traefik.http.routers.stablediffusion.middlewares=ipwhitelist"
```

## 2. Authentification par Token/Clé API

### Configuration Gradio
```python
# Dans votre script de lancement
import gradio as gr

def check_api_key(api_key):
    valid_keys = ["key1", "key2", "key3"]
    return api_key in valid_keys

# Interface avec vérification
with gr.Blocks() as demo:
    api_key_input = gr.Textbox(label="Clé API", type="password")
    if gr.Button("Accéder").click(fn=check_api_key, inputs=api_key_input):
        # Afficher l'interface principale
```

## 3. Limitation par Nombre de Connexions

### Configuration Nginx
```nginx
# Limiter le nombre de connexions simultanées
limit_conn_zone $binary_remote_addr zone=stablediffusion:10m;
limit_conn stablediffusion 5;  # Max 5 connexions par IP
```

### Configuration Traefik
```yaml
# Limitation de débit
- "traefik.http.middlewares.ratelimit.ratelimit.average=10"
- "traefik.http.middlewares.ratelimit.ratelimit.burst=20"
```

## 4. Protection par Heure d'Accès

### Script de Contrôle
```python
import datetime
import gradio as gr

def check_time_access():
    now = datetime.datetime.now()
    # Autoriser seulement entre 8h et 22h
    if now.hour < 8 or now.hour >= 22:
        return False, "Accès fermé entre 22h et 8h"
    return True, "Accès autorisé"

# Intégration dans Gradio
with gr.Blocks() as demo:
    if check_time_access()[0]:
        # Interface normale
    else:
        gr.HTML("<h2>Accès temporairement fermé</h2>")
```

## 5. Protection par Réseau VPN

### Configuration Docker
```yaml
# docker-compose.yml
services:
  stablediffusion:
    networks:
      - vpn_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.stablediffusion.rule=Host(`stablediffusion.regispailler.fr`)"
      - "traefik.http.routers.stablediffusion.entrypoints=websecure"
      - "traefik.http.routers.stablediffusion.tls=true"

networks:
  vpn_network:
    external: true
```

## 6. Monitoring et Logs

### Configuration de Logs
```python
import logging
from datetime import datetime

# Log des accès
logging.basicConfig(
    filename='stablediffusion_access.log',
    level=logging.INFO,
    format='%(asctime)s - %(remote_addr)s - %(message)s'
)

def log_access(remote_addr, user_agent):
    logging.info(f"Accès depuis {remote_addr} - User-Agent: {user_agent}")
```

## 7. Protection par Reverse Proxy avec Authentification

### Configuration Traefik avec Basic Auth
```yaml
# Générer le hash: htpasswd -nb user password
# docker-compose.yml
services:
  stablediffusion:
    labels:
      - "traefik.http.middlewares.auth.basicauth.users=user:$$2y$$10$$hashed_password"
      - "traefik.http.routers.stablediffusion.middlewares=auth"
```

## 8. Protection par Géolocalisation

### Configuration Nginx
```nginx
# Bloquer les pays non autorisés
geo $blocked_country {
    default 0;
    RU 1;  # Russie
    CN 1;  # Chine
    # Ajouter d'autres pays si nécessaire
}

location / {
    if ($blocked_country) {
        return 403;
    }
    # Configuration normale
}
```

## Recommandations par Ordre de Priorité

### 1. **Protection par IP** (Facile à mettre en place)
- ✅ Simple à configurer
- ✅ Très efficace pour usage local/réseau privé
- ✅ Pas d'impact sur les performances

### 2. **Limitation de Connexions** (Protection contre la surcharge)
- ✅ Évite la surcharge du serveur
- ✅ Protection contre les attaques DDoS basiques
- ✅ Configuration simple

### 3. **Monitoring et Logs** (Surveillance)
- ✅ Traçabilité des accès
- ✅ Détection d'activité suspecte
- ✅ Historique des utilisations

### 4. **Protection par Heure** (Contrôle temporel)
- ✅ Contrôle des heures d'utilisation
- ✅ Économies d'énergie
- ✅ Maintenance facilitée

## Configuration Recommandée Combinée

```yaml
# docker-compose.yml - Configuration complète
version: '3.8'
services:
  stablediffusion:
    image: your-stablediffusion-image
    labels:
      # Protection par IP
      - "traefik.http.middlewares.ipwhitelist.ipwhitelist.sourcerange=192.168.1.0/24,10.0.0.0/8"
      
      # Limitation de connexions
      - "traefik.http.middlewares.ratelimit.ratelimit.average=5"
      - "traefik.http.middlewares.ratelimit.ratelimit.burst=10"
      
      # Application des middlewares
      - "traefik.http.routers.stablediffusion.middlewares=ipwhitelist,ratelimit"
      
      # Logs
      - "traefik.http.middlewares.logs.headers.customrequestheaders.X-Real-IP=$${remote_addr}"
    
    environment:
      - GRADIO_SERVER_NAME=0.0.0.0
      - GRADIO_SERVER_PORT=7860
      - GRADIO_SHARE=False
      - GRADIO_AUTH=None  # Désactiver l'auth Gradio
    
    volumes:
      - ./logs:/app/logs
      - ./models:/app/models
    
    restart: unless-stopped
```

## Script de Monitoring

```python
# monitor_access.py
import time
import requests
import logging
from datetime import datetime

logging.basicConfig(
    filename='access_monitor.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def check_service_health():
    try:
        response = requests.get('http://localhost:7860', timeout=5)
        if response.status_code == 200:
            logging.info("Service StableDiffusion accessible")
            return True
        else:
            logging.warning(f"Service accessible mais code: {response.status_code}")
            return False
    except Exception as e:
        logging.error(f"Service StableDiffusion inaccessible: {e}")
        return False

def main():
    while True:
        check_service_health()
        time.sleep(60)  # Vérifier toutes les minutes

if __name__ == "__main__":
    main()
```

## Conclusion

La **protection par IP** combinée à une **limitation de connexions** est la solution la plus équilibrée pour votre cas d'usage. Elle offre :

- 🔒 Sécurité suffisante pour un usage privé
- ⚡ Performance optimale (pas de surcharge d'authentification)
- 🛠️ Configuration simple et maintenance facile
- 📊 Possibilité d'ajouter du monitoring

Cette approche vous permet de retirer la protection par mot de passe tout en gardant un contrôle d'accès efficace. 