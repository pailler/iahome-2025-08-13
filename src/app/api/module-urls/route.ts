import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');

    // Configuration des URLs des modules
    const moduleUrls: { [key: string]: string } = {
      'IAmetube': '/api/proxy-metube',
      // Ajouter d'autres modules ici quand ils seront disponibles
      // 'IAphoto': 'https://iaphoto.regispailler.fr',
      // 'IAvideo': 'https://iavideo.regispailler.fr',
      // 'IAassistant': 'https://iaassistant.regispailler.fr',
    };

    if (moduleName) {
      // Retourner l'URL d'un module spécifique
      const url = moduleUrls[moduleName];
      if (url) {
        return NextResponse.json({ url });
      } else {
        return NextResponse.json(
          { error: 'Module non trouvé' },
          { status: 404 }
        );
      }
    } else {
      // Retourner toutes les URLs
      return NextResponse.json({ moduleUrls });
    }

  } catch (error) {
    console.error('❌ Erreur module-urls:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
} 