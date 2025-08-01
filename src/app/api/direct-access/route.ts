import { NextRequest, NextResponse } from 'next/server';

// Configuration des modules avec des codes secrets
const MODULES_CONFIG: Record<string, {
  code: string;
  url: string;
  credentials: { username: string; password: string };
  name: string;
}> = {
  'SD': {
    code: 'SD',
    url: 'https://stablediffusion.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    name: 'Stable Diffusion'
  },

  'IM': {
    code: 'IM',
    url: 'https://iametube.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    name: 'IA Metube'
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    console.log('🔐 Accès direct demandé avec code:', code);

    if (!code || !MODULES_CONFIG[code]) {
      console.error('❌ Code invalide:', code);
      return NextResponse.json(
        { error: 'Code d\'accès invalide' },
        { status: 404 }
      );
    }

    const module = MODULES_CONFIG[code];
    console.log('🎯 Module cible:', module.name);

    // Créer l'URL avec authentification HTTP Basic
    const credentials = Buffer.from(`${module.credentials.username}:${module.credentials.password}`).toString('base64');
    const authUrl = `${module.url.replace('https://', `https://${credentials}@`)}`;

    console.log('🔗 Redirection vers:', module.name);

    // Redirection directe vers le module avec authentification
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('❌ Erreur accès direct:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 