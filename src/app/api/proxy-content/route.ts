import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken, hasPermission } from '../../../utils/accessToken';

// Configuration des credentials pour chaque module
const MODULE_CREDENTIALS: { [key: string]: { username: string; password: string } } = {
  'stablediffusion': {
    username: process.env.STABLEDIFFUSION_USERNAME || 'admin',
    password: process.env.STABLEDIFFUSION_PASSWORD || 'Rasulova75'
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const module = searchParams.get('module');
    const path = searchParams.get('path') || '';

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

    // Configuration des URLs de base pour chaque module
    const moduleUrls: { [key: string]: string } = {
      'stablediffusion': 'https://stablediffusion.regispailler.fr',
    };

    const targetUrl = moduleUrls[module];
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

    // Construire l'URL cible
    const fullUrl = `${targetUrl}${path}`;
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
    const content = await response.text();

    console.log('✅ Contenu récupéré avec succès, type:', contentType);

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