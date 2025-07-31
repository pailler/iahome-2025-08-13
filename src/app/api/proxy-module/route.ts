import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken, hasPermission } from '../../../utils/accessToken';

// Configuration des credentials pour chaque module
const MODULE_CREDENTIALS: { [key: string]: { username: string; password: string } } = {
  'stablediffusion': {
    username: process.env.STABLEDIFFUSION_USERNAME || 'admin',
    password: process.env.STABLEDIFFUSION_PASSWORD || 'Rasulova75'
  },
};

// Configuration des URLs de base pour chaque module
const MODULE_URLS: { [key: string]: string } = {
  'stablediffusion': 'https://stablediffusion.regispailler.fr',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const module = searchParams.get('module');

    if (!token || !module) {
      return NextResponse.json(
        { error: 'Token ou module manquant' },
        { status: 400 }
      );
    }

    // Valider le token d'accès
    const accessData = await validateAccessToken(token);
    if (!accessData) {
      console.error('❌ Token invalide ou expiré:', token);
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 403 }
      );
    }

    // Vérifier les permissions
    if (!hasPermission(accessData, 'access')) {
      console.error('❌ Permissions insuffisantes pour le token:', token);
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    const targetUrl = MODULE_URLS[module];
    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Module non reconnu' },
        { status: 400 }
      );
    }

    // Récupérer les credentials pour ce module
    const credentials = MODULE_CREDENTIALS[module];
    if (!credentials) {
      return NextResponse.json(
        { error: 'Configuration des credentials manquante' },
        { status: 500 }
      );
    }

    console.log('🔍 Redirection vers:', targetUrl);
    console.log('🔐 Credentials:', `${credentials.username}/${credentials.password}`);

              // Pour Stable Diffusion, créer une page HTML qui authentifie via fetch
     if (module === 'stablediffusion') {
       console.log('🔗 Page d\'authentification automatique vers Stable Diffusion');
       
               const html = `<!DOCTYPE html>
<html>
<head>
    <title>Authentification Stable Diffusion</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error {
            color: #ff6b6b;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h2>Authentification Stable Diffusion</h2>
        <p>Connexion automatique en cours...</p>
        <div id="status"></div>
    </div>
    
    <script>
        async function authenticateAndRedirect() {
            const targetUrl = "${targetUrl.replace(/"/g, '\\"')}";
            const username = "${credentials.username.replace(/"/g, '\\"')}";
            const password = "${credentials.password.replace(/"/g, '\\"')}";
            const statusDiv = document.getElementById('status');
            
            try {
                // Essayer d'authentifier via fetch avec HTTP Basic Auth
                const response = await fetch(targetUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Basic ' + btoa(username + ':' + password)
                    },
                    credentials: 'include'
                });
                
                if (response.ok) {
                    statusDiv.innerHTML = '<p style="color: #51cf66;">Authentification reussie ! Redirection...</p>';
                    // Rediriger vers Stable Diffusion
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 1000);
                } else {
                    throw new Error('Authentification echouee');
                }
            } catch (error) {
                console.error('Erreur d\'authentification:', error);
                statusDiv.innerHTML = '<p class="error">Erreur d\'authentification</p><p>Redirection directe...</p>';
                
                // En cas d'echec, essayer la redirection directe
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 2000);
            }
        }
        
        // Executer l'authentification apres le chargement
        window.onload = function() {
            setTimeout(authenticateAndRedirect, 1000);
        };
    </script>
</body>
</html>`;

       return new NextResponse(html, {
         status: 200,
         headers: {
           'Content-Type': 'text/html',
           'Cache-Control': 'no-cache'
         }
       });
     }

    // Pour les autres modules, comportement par défaut
    return NextResponse.json(
      { error: 'Module non supporté pour l\'ouverture en nouvel onglet' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erreur proxy:', error);
    return NextResponse.json(
      { error: 'Erreur interne du proxy' },
      { status: 500 }
    );
  }
} 