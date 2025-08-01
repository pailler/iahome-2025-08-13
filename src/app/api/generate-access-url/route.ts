import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes } from 'crypto';

// Configuration des modules
const MODULES_CONFIG: Record<string, {
  url: string;
  credentials: { username: string; password: string };
  type: string;
}> = {
  stablediffusion: {
    url: 'https://stablediffusion.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    type: 'http-basic'
  },

  iametube: {
    url: 'https://iametube.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    type: 'http-basic'
  }
};

// Stockage temporaire des tokens (en production, utilisez Redis ou une base de données)
const accessTokens = new Map<string, {
  module: string;
  expiresAt: number;
  ip: string;
}>();

const SECRET_KEY = process.env.ACCESS_SECRET_KEY || 'your-secret-key-change-this';
const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module, duration = 30 } = body; // duration en minutes

    console.log('🔐 Génération URL d\'accès pour:', module);

    if (!MODULES_CONFIG[module]) {
      return NextResponse.json(
        { error: `Module ${module} non configuré` },
        { status: 400 }
      );
    }

    // Générer un token unique
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (duration * 60 * 1000);
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Stocker le token
    accessTokens.set(token, {
      module,
      expiresAt,
      ip
    });

    // Nettoyer les tokens expirés
    cleanupExpiredTokens();

    // Générer l'URL d'accès
    const accessUrl = `${request.nextUrl.origin}/access/${token}`;

    console.log('✅ URL d\'accès générée:', accessUrl);

    return NextResponse.json({
      success: true,
      accessUrl,
      token,
      expiresAt: new Date(expiresAt).toISOString(),
      module
    });

  } catch (error) {
    console.error('❌ Erreur génération URL:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    console.log('🔐 Vérification token:', token);

    // Vérifier le token
    const tokenData = accessTokens.get(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    if (Date.now() > tokenData.expiresAt) {
      accessTokens.delete(token);
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      );
    }

    const { module } = tokenData;
    const config = MODULES_CONFIG[module];

    // Proxy avec authentification
    const credentials = Buffer.from(`${config.credentials.username}:${config.credentials.password}`).toString('base64');
    
    const headers = new Headers();
    headers.set('Authorization', `Basic ${credentials}`);
    headers.set('User-Agent', 'IAHome-Secure-Proxy/1.0');

    const response = await fetch(config.url, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Réponse module sécurisé:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Erreur module:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erreur ${module}: ${response.status}` },
        { status: response.status }
      );
    }

    // Récupérer le contenu HTML
    const html = await response.text();

    // Modifier le HTML pour injecter l'authentification automatique
    const modifiedHtml = html.replace(
      '</head>',
      `
      <script>
        // Injection automatique des credentials pour ${module}
        window.addEventListener('load', function() {
          setTimeout(function() {
            // Chercher les champs de formulaire
            const usernameInputs = document.querySelectorAll('input[name="username"], input[name="user"], input[type="text"]');
            const passwordInputs = document.querySelectorAll('input[name="password"], input[name="pass"], input[type="password"]');
            
            if (usernameInputs.length > 0 && passwordInputs.length > 0) {
              // Remplir les champs
              usernameInputs[0].value = '${config.credentials.username}';
              passwordInputs[0].value = '${config.credentials.password}';
              
              // Trouver et soumettre le formulaire
              const form = usernameInputs[0].closest('form') || passwordInputs[0].closest('form');
              if (form) {
                console.log('🔐 Authentification automatique pour ${module}...');
                setTimeout(function() {
                  form.submit();
                }, 500);
              }
            }
          }, 1000);
        });
      </script>
      </head>
      `
    );

    console.log('✅ HTML modifié avec authentification automatique pour', module);

    // Retourner le HTML modifié
    return new NextResponse(modifiedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Secure-Proxy',
        'X-Module': module,
        'X-Token': token.substring(0, 8) + '...',
      },
    });

  } catch (error) {
    console.error('❌ Erreur accès sécurisé:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of accessTokens.entries()) {
    if (now > data.expiresAt) {
      accessTokens.delete(token);
    }
  }
} 