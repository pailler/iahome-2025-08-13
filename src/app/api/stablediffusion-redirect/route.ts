import { NextRequest, NextResponse } from 'next/server';

const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';
const STABLEDIFFUSION_CREDENTIALS = {
  username: 'admin',
  password: 'Rasulova75'
};

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Redirection Stable Diffusion demandée');

    // Créer l'URL avec les credentials
    const credentials = `${STABLEDIFFUSION_CREDENTIALS.username}:${STABLEDIFFUSION_CREDENTIALS.password}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');
    
    // Construire l'URL avec authentification
    const authUrl = `${STABLEDIFFUSION_URL.replace('https://', `https://${encodedCredentials}@`)}`;
    
    console.log('🔗 Redirection vers:', authUrl);

    // Redirection vers Stable Diffusion avec authentification
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('❌ Erreur redirection Stable Diffusion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 