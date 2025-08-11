import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken, hasPermission } from '../../../../utils/accessToken';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
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

    // Construire le chemin complet
    let fullUrl = targetUrl;
    const resolvedParams = await params;
    if (resolvedParams.path && resolvedParams.path.length > 0) {
      const path = resolvedParams.path.join('/');
      fullUrl = `${targetUrl}/${path}`;
    }
    
    console.log('🔍 Proxy vers:', fullUrl);

    // Encoder les credentials en base64
    const authString = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');

    // Faire la requête avec authentification
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'User-Agent': 'IAHome-Proxy/1.0'
      }
    });

    if (!response.ok) {
      console.error('❌ Erreur lors de la récupération:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erreur lors de l'accès: ${response.status}` },
        { status: response.status }
      );
    }

    // Récupérer le contenu
    const contentType = response.headers.get('content-type') || 'text/html';
    let content = await response.text();

    console.log('✅ Contenu récupéré avec succès, type:', contentType);

    // Si c'est du HTML, modifier les URLs pour qu'elles passent par le proxy
    if (contentType.includes('text/html')) {
      console.log('🔧 Modification des URLs dans le HTML...');
      content = content.replace(
        /(src|href)=["']([^"']*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))["']/g,
        (match, attr, url) => {
          // Si c'est une URL relative, la transformer en requête proxy
          if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            const proxyUrl = `/api/proxy-module/${url}?token=${token}&module=${module}`;
            return `${attr}="${proxyUrl}"`;
          }
          // Si c'est une URL absolue du même domaine, la transformer aussi
          if (url.includes('stablediffusion.regispailler.fr')) {
            const path = new URL(url).pathname;
            const proxyUrl = `/api/proxy-module${path}?token=${token}&module=${module}`;
            return `${attr}="${proxyUrl}"`;
          }
          return match;
        }
      );
      console.log('✅ URLs modifiées dans le HTML');
    }

    // Retourner le contenu avec les bons en-têtes
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome'
      }
    });

  } catch (error) {
    console.error('❌ Erreur proxy:', error);
    return NextResponse.json(
      { error: 'Erreur interne du proxy' },
      { status: 500 }
    );
  }
} 