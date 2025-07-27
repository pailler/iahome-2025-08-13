import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken, hasPermission } from '../../../utils/accessToken';

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
    const accessData = validateAccessToken(token);
    if (!accessData) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 403 }
      );
    }

    // Vérifier les permissions
    if (!hasPermission(accessData, 'access')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    // Configuration des URLs de base pour chaque module
    const moduleUrls: { [key: string]: string } = {
      'IAmetube': 'https://metube.regispailler.fr',
      'IAphoto': 'https://iaphoto.regispailler.fr',
      'IAvideo': 'https://iavideo.regispailler.fr',
    };

    const targetUrl = moduleUrls[module];
    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Module non reconnu' },
        { status: 400 }
      );
    }

    // Rediriger vers l'application avec le token en paramètre
    const finalUrl = `${targetUrl}?access_token=${token}`;
    
    console.log('✅ Proxy redirection vers:', finalUrl);

    return NextResponse.redirect(finalUrl);

  } catch (error) {
    console.error('❌ Erreur proxy:', error);
    return NextResponse.json(
      { error: 'Erreur interne du proxy' },
      { status: 500 }
    );
  }
} 