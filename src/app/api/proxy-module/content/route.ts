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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const module = searchParams.get('module');
    const path = searchParams.get('path');

    if (!token || !module || !path) {
      return NextResponse.json(
        { error: 'Token, module ou path manquant' },
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

    const baseUrl = MODULE_URLS[module];
    if (!baseUrl) {
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

    // Construire l'URL complète
    const targetUrl = `${baseUrl}${path}`;
    console.log('🔗 Proxy content vers:', targetUrl);

    try {
      // Récupérer le contenu avec authentification
      const response = await fetch(targetUrl, {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')
        }
      });

      if (!response.ok) {
        console.error('❌ Erreur lors de la récupération du contenu:', response.status);
        return NextResponse.json(
          { error: 'Impossible d\'accéder à la ressource' },
          { status: response.status }
        );
      }

      // Récupérer le contenu et les headers
      const content = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      // Retourner le contenu avec les bons headers
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        }
      });

    } catch (error) {
      console.error('❌ Erreur proxy content:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de la ressource' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erreur proxy content:', error);
    return NextResponse.json(
      { error: 'Erreur interne du proxy content' },
      { status: 500 }
    );
  }
} 