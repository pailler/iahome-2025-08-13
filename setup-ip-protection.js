#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔒 Configuration de la Protection par IP pour StableDiffusion\n');

// Configuration par défaut
const defaultConfig = {
  allowedIPs: ['192.168.1.0/24', '10.0.0.0/8', '127.0.0.1/32'],
  rateLimit: {
    average: 5,
    burst: 10
  },
  port: 7860,
  domain: 'stablediffusion.regispailler.fr'
};

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function getConfiguration() {
  console.log('Configuration actuelle:');
  console.log(`- IPs autorisées: ${defaultConfig.allowedIPs.join(', ')}`);
  console.log(`- Limite de connexions: ${defaultConfig.rateLimit.average} par seconde`);
  console.log(`- Port: ${defaultConfig.port}`);
  console.log(`- Domaine: ${defaultConfig.domain}\n`);

  const useDefault = await question('Utiliser la configuration par défaut? (o/n): ');
  
  if (useDefault.toLowerCase() === 'o' || useDefault.toLowerCase() === 'oui') {
    return defaultConfig;
  }

  // Configuration personnalisée
  const customIPs = await question('IPs autorisées (séparées par des virgules): ');
  const customRateLimit = await question('Limite de connexions par seconde (défaut: 5): ');
  const customPort = await question('Port StableDiffusion (défaut: 7860): ');
  const customDomain = await question('Domaine (défaut: stablediffusion.regispailler.fr): ');

  return {
    allowedIPs: customIPs ? customIPs.split(',').map(ip => ip.trim()) : defaultConfig.allowedIPs,
    rateLimit: {
      average: parseInt(customRateLimit) || defaultConfig.rateLimit.average,
      burst: parseInt(customRateLimit) * 2 || defaultConfig.rateLimit.burst
    },
    port: parseInt(customPort) || defaultConfig.port,
    domain: customDomain || defaultConfig.domain
  };
}

function generateDockerCompose(config) {
  return `version: '3.8'

services:
  stablediffusion:
    image: your-stablediffusion-image  # Remplacez par votre image
    container_name: stablediffusion
    restart: unless-stopped
    
    environment:
      - GRADIO_SERVER_NAME=0.0.0.0
      - GRADIO_SERVER_PORT=${config.port}
      - GRADIO_SHARE=False
      - GRADIO_AUTH=None  # Désactiver l'auth Gradio
    
    volumes:
      - ./models:/app/models
      - ./outputs:/app/outputs
      - ./logs:/app/logs
    
    networks:
      - stablediffusion_network
    
    labels:
      # Activation de Traefik
      - "traefik.enable=true"
      - "traefik.docker.network=stablediffusion_network"
      
      # Configuration du routeur
      - "traefik.http.routers.stablediffusion.rule=Host(\`${config.domain}\`)"
      - "traefik.http.routers.stablediffusion.entrypoints=websecure"
      - "traefik.http.routers.stablediffusion.tls=true"
      - "traefik.http.routers.stablediffusion.tls.certresolver=letsencrypt"
      
      # Service
      - "traefik.http.services.stablediffusion.loadbalancer.server.port=${config.port}"
      
      # Protection par IP
      - "traefik.http.middlewares.ipwhitelist.ipwhitelist.sourcerange=${config.allowedIPs.join(',')}"
      
      # Limitation de débit
      - "traefik.http.middlewares.ratelimit.ratelimit.average=${config.rateLimit.average}"
      - "traefik.http.middlewares.ratelimit.ratelimit.burst=${config.rateLimit.burst}"
      
      # Headers de sécurité
      - "traefik.http.middlewares.security.headers.customrequestheaders.X-Real-IP=\${remote_addr}"
      - "traefik.http.middlewares.security.headers.customrequestheaders.X-Forwarded-For=\${remote_addr}"
      
      # Application des middlewares
      - "traefik.http.routers.stablediffusion.middlewares=ipwhitelist,ratelimit,security"

  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard Traefik
    
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/acme.json:/acme.json
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml
    
    networks:
      - stablediffusion_network
    
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.${config.domain}\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls=true"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.services.traefik.loadbalancer.server.port=8080"

networks:
  stablediffusion_network:
    driver: bridge

volumes:
  stablediffusion_data:
`;
}

function generateTraefikConfig(config) {
  return `# traefik.yml
global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: true
  debug: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
          permanent: true
  
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: stablediffusion_network

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com  # Remplacez par votre email
      storage: /acme.json
      httpChallenge:
        entryPoint: web

log:
  level: INFO

accessLog:
  filePath: "/var/log/traefik/access.log"
  format: json

metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
`;
}

function generateNginxConfig(config) {
  return `# nginx.conf - Alternative si vous préférez Nginx
server {
    listen 80;
    server_name ${config.domain};
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${config.domain};
    
    # Certificats SSL (à configurer selon votre setup)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Protection par IP
    ${config.allowedIPs.map(ip => `allow ${ip};`).join('\n    ')}
    deny all;
    
    # Limitation de connexions
    limit_conn_zone $binary_remote_addr zone=stablediffusion:10m;
    limit_conn stablediffusion ${config.rateLimit.average};
    
    # Limitation de débit
    limit_req_zone $binary_remote_addr zone=ratelimit:10m rate=${config.rateLimit.average}r/s;
    limit_req zone=ratelimit burst=${config.rateLimit.burst} nodelay;
    
    location / {
        proxy_pass http://localhost:${config.port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Logs
    access_log /var/log/nginx/stablediffusion_access.log;
    error_log /var/log/nginx/stablediffusion_error.log;
}
`;
}

function generateMonitoringScript(config) {
  return `#!/usr/bin/env python3
# monitor_stablediffusion.py

import time
import requests
import logging
import json
from datetime import datetime
from pathlib import Path

# Configuration
CONFIG = {
    'service_url': f'https://{config.domain}',
    'check_interval': 60,  # secondes
    'log_file': 'stablediffusion_monitor.log',
    'alert_file': 'alerts.json'
}

# Configuration des logs
logging.basicConfig(
    filename=CONFIG['log_file'],
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def check_service_health():
    """Vérifie la santé du service StableDiffusion"""
    try:
        response = requests.get(CONFIG['service_url'], timeout=10)
        if response.status_code == 200:
            logging.info("✅ Service StableDiffusion accessible")
            return True, "OK"
        else:
            logging.warning(f"⚠️ Service accessible mais code: {response.status_code}")
            return False, f"Code HTTP: {response.status_code}"
    except requests.exceptions.ConnectionError:
        logging.error("❌ Service StableDiffusion inaccessible - Erreur de connexion")
        return False, "Erreur de connexion"
    except requests.exceptions.Timeout:
        logging.error("⏰ Service StableDiffusion inaccessible - Timeout")
        return False, "Timeout"
    except Exception as e:
        logging.error(f"❌ Erreur inconnue: {e}")
        return False, str(e)

def save_alert(status, message):
    """Sauvegarde les alertes dans un fichier JSON"""
    alert = {
        'timestamp': datetime.now().isoformat(),
        'status': status,
        'message': message
    }
    
    alerts = []
    if Path(CONFIG['alert_file']).exists():
        with open(CONFIG['alert_file'], 'r') as f:
            alerts = json.load(f)
    
    alerts.append(alert)
    
    # Garder seulement les 100 dernières alertes
    if len(alerts) > 100:
        alerts = alerts[-100:]
    
    with open(CONFIG['alert_file'], 'w') as f:
        json.dump(alerts, f, indent=2)

def main():
    print(f"🔍 Démarrage du monitoring pour {CONFIG['service_url']}")
    print(f"📝 Logs: {CONFIG['log_file']}")
    print(f"🚨 Alertes: {CONFIG['alert_file']}")
    print("Appuyez sur Ctrl+C pour arrêter\\n")
    
    consecutive_failures = 0
    
    while True:
        try:
            is_healthy, message = check_service_health()
            
            if is_healthy:
                if consecutive_failures > 0:
                    print(f"✅ Service rétabli - {datetime.now().strftime('%H:%M:%S')}")
                    save_alert('recovered', 'Service rétabli')
                consecutive_failures = 0
            else:
                consecutive_failures += 1
                print(f"❌ Service défaillant ({consecutive_failures}x) - {message}")
                
                if consecutive_failures >= 3:
                    save_alert('critical', f'Service défaillant depuis {consecutive_failures} vérifications: {message}')
            
            time.sleep(CONFIG['check_interval'])
            
        except KeyboardInterrupt:
            print("\\n🛑 Arrêt du monitoring")
            break
        except Exception as e:
            logging.error(f"Erreur dans le monitoring: {e}")
            time.sleep(CONFIG['check_interval'])

if __name__ == "__main__":
    main()
`;
}

function generateStartScript() {
  return `#!/bin/bash
# start-stablediffusion.sh

echo "🚀 Démarrage de StableDiffusion avec protection par IP..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Créer les dossiers nécessaires
mkdir -p logs
mkdir -p models
mkdir -p outputs
mkdir -p traefik

# Créer le fichier acme.json pour Let's Encrypt
touch traefik/acme.json
chmod 600 traefik/acme.json

# Démarrer les services
echo "📦 Démarrage des conteneurs..."
docker-compose up -d

# Attendre que les services démarrent
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier le statut
echo "🔍 Vérification du statut..."
docker-compose ps

echo "✅ StableDiffusion démarré avec protection par IP"
echo "🌐 Accès: https://stablediffusion.regispailler.fr"
echo "📊 Dashboard Traefik: https://traefik.stablediffusion.regispailler.fr"
echo "📝 Logs: docker-compose logs -f stablediffusion"
`;
}

function generateStopScript() {
  return `#!/bin/bash
# stop-stablediffusion.sh

echo "🛑 Arrêt de StableDiffusion..."

# Arrêter les conteneurs
docker-compose down

echo "✅ Services arrêtés"
`;
}

async function main() {
  try {
    const config = await getConfiguration();
    
    console.log('\\n📝 Génération des fichiers de configuration...\\n');
    
    // Créer le dossier de configuration
    const configDir = './stablediffusion-ip-protection';
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Générer les fichiers
    const files = {
      'docker-compose.yml': generateDockerCompose(config),
      'traefik/traefik.yml': generateTraefikConfig(config),
      'nginx.conf': generateNginxConfig(config),
      'monitor_stablediffusion.py': generateMonitoringScript(config),
      'start-stablediffusion.sh': generateStartScript(),
      'stop-stablediffusion.sh': generateStopScript()
    };
    
    for (const [filename, content] of Object.entries(files)) {
      const filepath = path.join(configDir, filename);
      const dir = path.dirname(filepath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filepath, content);
      console.log(`✅ ${filename}`);
    }
    
    // Créer un README
    const readme = `# Protection par IP pour StableDiffusion

## Configuration générée

- **IPs autorisées**: ${config.allowedIPs.join(', ')}
- **Limite de connexions**: ${config.rateLimit.average} par seconde
- **Port**: ${config.port}
- **Domaine**: ${config.domain}

## Utilisation

### Option 1: Docker Compose avec Traefik (Recommandé)
\`\`\`bash
cd stablediffusion-ip-protection
chmod +x start-stablediffusion.sh stop-stablediffusion.sh
./start-stablediffusion.sh
\`\`\`

### Option 2: Nginx
1. Copiez le contenu de \`nginx.conf\` dans votre configuration Nginx
2. Configurez vos certificats SSL
3. Redémarrez Nginx

### Monitoring
\`\`\`bash
python3 monitor_stablediffusion.py
\`\`\`

## Fichiers générés

- \`docker-compose.yml\` - Configuration Docker avec Traefik
- \`traefik/traefik.yml\` - Configuration Traefik
- \`nginx.conf\` - Configuration Nginx alternative
- \`monitor_stablediffusion.py\` - Script de monitoring
- \`start-stablediffusion.sh\` - Script de démarrage
- \`stop-stablediffusion.sh\` - Script d'arrêt

## Personnalisation

1. Modifiez \`docker-compose.yml\` pour utiliser votre image StableDiffusion
2. Ajustez les IPs autorisées selon vos besoins
3. Configurez votre email dans \`traefik/traefik.yml\` pour Let's Encrypt
`;
    
    fs.writeFileSync(path.join(configDir, 'README.md'), readme);
    console.log('✅ README.md');
    
    console.log('\\n🎉 Configuration terminée !');
    console.log(\`📁 Fichiers générés dans: \${configDir}\`);
    console.log('\\n📋 Prochaines étapes:');
    console.log('1. Modifiez docker-compose.yml avec votre image StableDiffusion');
    console.log('2. Configurez votre email dans traefik/traefik.yml');
    console.log('3. Lancez ./start-stablediffusion.sh');
    console.log('\\n🔒 Votre StableDiffusion sera protégé par IP et limitation de connexions !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
}

main(); 