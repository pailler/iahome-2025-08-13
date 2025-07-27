# Guide de Configuration Synology DSM pour Magic Links

## 🔧 Étape 1 : Vérifier l'état actuel

### 1.1 Vérifier que les containers sont démarrés
```bash
# Dans le terminal SSH de ton NAS
docker ps | grep metube
```

Tu devrais voir :
- `metube` (port 8081)
- `metube-gateway` (port 8083)

### 1.2 Vérifier les ports
```bash
netstat -tulpn | grep :8083
```

## 🔧 Étape 2 : Configuration Reverse Proxy DSM

### 2.1 Accéder au Reverse Proxy
1. **DSM** → **Panneau de configuration**
2. **Application Portal** → **Reverse Proxy**

### 2.2 Créer une nouvelle règle
**Cliquer sur "Créer"**

**Configuration Source :**
- **Nom de la règle :** `metube-magic-links`
- **Protocole :** `HTTPS`
- **Hôte :** `metube.regispailler.fr`
- **Port :** `443`

**Configuration Destination :**
- **Protocole :** `HTTP`
- **Hôte :** `localhost` (ou l'IP de ton NAS)
- **Port :** `8083`

### 2.3 Configuration avancée (optionnel)
**Onglet "Personnalisé" :**
- **En-têtes HTTP :**
  - `X-Forwarded-Host: metube.regispailler.fr`
  - `X-Forwarded-Proto: https`

## 🔧 Étape 3 : Alternative - Test local

Si le reverse proxy pose problème, testons d'abord en local :

### 3.1 Modifier le gateway.conf pour test
```nginx
server {
    listen 80;
    server_name localhost;

    # Si magic link, afficher page de validation
    location / {
        if ($arg_token) {
            return 200 '
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Validation - IAmetube</title>
                <meta charset="utf-8">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: #f0f0f0;
                    }
                    .container { 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        max-width: 500px;
                        margin: 0 auto;
                    }
                    .success { color: #388e3c; }
                    .error { color: #d32f2f; }
                    .btn {
                        background: #007cba;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        text-decoration: none;
                        display: inline-block;
                        margin-top: 15px;
                    }
                </style>
                <script>
                    async function validate() {
                        const urlParams = new URLSearchParams(window.location.search);
                        const token = urlParams.get("token");
                        const user = urlParams.get("user");
                        const module = urlParams.get("module");
                        
                        document.getElementById("status").innerHTML = 
                            "<h2>🔍 Test de validation</h2>" +
                            "<p><strong>Token:</strong> " + token + "</p>" +
                            "<p><strong>User:</strong> " + user + "</p>" +
                            "<p><strong>Module:</strong> " + module + "</p>";
                        
                        try {
                            const response = await fetch(`https://home.regispailler.fr/api/validate-magic-link?token=${token}&user=${user}&module=${module}`);
                            const data = await response.json();
                            
                            if (data.valid) {
                                document.getElementById("result").innerHTML = 
                                    "<h3 class=\"success\">✅ Validation réussie !</h3>" +
                                    "<p>Le magic link est valide.</p>" +
                                    "<a href=\"http://localhost:8081\" class=\"btn\">Accéder à Metube</a>";
                            } else {
                                document.getElementById("result").innerHTML = 
                                    "<h3 class=\"error\">❌ Validation échouée</h3>" +
                                    "<p>Erreur: " + (data.error || "Inconnue") + "</p>";
                            }
                        } catch (error) {
                            document.getElementById("result").innerHTML = 
                                "<h3 class=\"error\">❌ Erreur de connexion</h3>" +
                                "<p>Impossible de contacter l\'API de validation.</p>";
                        }
                    }
                    validate();
                </script>
            </head>
            <body>
                <div class="container">
                    <div id="status">
                        <h1>Test Magic Link</h1>
                        <p>Analyse en cours...</p>
                    </div>
                    <div id="result"></div>
                </div>
            </body>
            </html>
            ';
            add_header Content-Type text/html;
        }
        
        # Sinon, rediriger vers metube
        return 302 http://metube:8081$request_uri;
    }
}
```

## 🔧 Étape 4 : Test de diagnostic

### 4.1 Test direct du container
```bash
# Tester le container gateway
curl "http://localhost:8083/?token=test&user=test&module=test"
```

### 4.2 Test de l'API de validation
```bash
# Tester l'API directement
curl "https://home.regispailler.fr/api/validate-magic-link?token=61708784d9f9d882f7cdd96e46c810b1fb21b7c57e1006dbdbc2195dbcda52fe&user=4ff83788-7bdb-4633-a693-3ad98006fed5&module=IAmetube"
```

## 🔧 Étape 5 : Solutions alternatives

### 5.1 Solution temporaire - Accès direct
Si le reverse proxy pose problème, tu peux temporairement accéder directement :
```
http://[IP-NAS]:8083/?token=61708784d9f9d882f7cdd96e46c810b1fb21b7c57e1006dbdbc2195dbcda52fe&user=4ff83788-7bdb-4633-a693-3ad98006fed5&module=IAmetube
```

### 5.2 Vérifier les logs
```bash
# Logs du container gateway
docker logs metube-gateway

# Logs de metube
docker logs metube
```

## 🚨 Problèmes courants

### Problème 1 : Port 8083 non accessible
**Solution :** Vérifier que le port est ouvert dans le pare-feu DSM

### Problème 2 : Reverse proxy ne fonctionne pas
**Solution :** Utiliser l'accès direct temporairement

### Problème 3 : Container ne démarre pas
**Solution :** Vérifier les logs et les permissions des fichiers

## 📋 Checklist de vérification

- [ ] Containers démarrés (`docker ps`)
- [ ] Port 8083 accessible (`netstat -tulpn | grep :8083`)
- [ ] Reverse proxy configuré dans DSM
- [ ] DNS `metube.regispailler.fr` pointe vers ton NAS
- [ ] API de validation fonctionne (`curl` test)
- [ ] Magic link testé avec succès

**Dis-moi ce que tu vois dans les logs et on résoudra le problème ensemble !** 🔧 