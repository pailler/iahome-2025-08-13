# Configuration Cloudflare Tunnel pour IAHome

## Étape 1 : Créer un compte Cloudflare

1. **Allez sur** https://cloudflare.com/
2. **Créez un compte gratuit**
3. **Ajoutez votre domaine** `iahome.fr`

## Étape 2 : Installer cloudflared

1. **Téléchargez cloudflared** depuis : https://github.com/cloudflare/cloudflared/releases/latest
2. **Extrayez** le fichier `cloudflared.exe`
3. **Placez-le** dans `C:\cloudflared\`

## Étape 3 : Configurer le tunnel

```bash
# Se connecter à Cloudflare
C:\cloudflared\cloudflared.exe tunnel login

# Créer un tunnel
C:\cloudflared\cloudflared.exe tunnel create iahome-tunnel

# Configurer le tunnel
C:\cloudflared\cloudflared.exe tunnel route dns iahome-tunnel iahome.fr
```

## Étape 4 : Créer le fichier de configuration

Créez `C:\cloudflared\config.yml` :
```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: C:\cloudflared\YOUR_TUNNEL_ID.json

ingress:
  - hostname: iahome.fr
    service: http://localhost:3000
  - hostname: www.iahome.fr
    service: http://localhost:3000
  - service: http_status:404
```

## Étape 5 : Démarrer le tunnel

```bash
C:\cloudflared\cloudflared.exe tunnel run iahome-tunnel
```

## Étape 6 : Configurer comme service Windows

```bash
C:\cloudflared\cloudflared.exe service install
```

## Avantages de Cloudflare Tunnel :
- ✅ **Gratuit** et illimité
- ✅ **SSL automatique**
- ✅ **Plus stable** que ngrok
- ✅ **Pas de limite** de temps
