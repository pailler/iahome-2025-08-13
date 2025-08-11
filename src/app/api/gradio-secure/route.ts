import { NextRequest, NextResponse } from 'next/server';
import { verifyGradioToken } from '../../../utils/gradioToken';

// URL de l'application RuinedFooocus
const RUINEDFOOOCUS_URL = 'https://da4be546aab3e23055.gradio.live/';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      console.log('❌ Accès Gradio refusé - Pas de token');
      
      return NextResponse.json(
        { error: 'Token requis pour accéder à Gradio' },
        { status: 401 }
      );
    }
    
    // Vérifier le token
    const tokenData = verifyGradioToken(token);
    
    if (!tokenData) {
      console.log('❌ Accès Gradio refusé - Token invalide');
      
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    // Vérifier si le token n'a pas expiré
    const now = Math.floor(Date.now() / 1000);
    if (tokenData.expiresAt < now) {
      console.log(`❌ Accès Gradio refusé - Token expiré pour utilisateur ${tokenData.userId}`);
      
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      );
    }
    
    // Vérifier l'IP (optionnel, pour plus de sécurité)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') ||
                    'unknown';
    
    if (tokenData.ip !== clientIP) {
      console.log(`⚠️  IP différente: Token=${tokenData.ip}, Client=${clientIP}`);
      // On peut choisir de bloquer ou juste logger
    }
    
    console.log(`✅ Accès Gradio autorisé pour utilisateur ${tokenData.userId} - Module: ${tokenData.moduleTitle}`);
    
    // Rediriger vers Gradio avec le token en paramètre
    const gradioUrl = new URL(RUINEDFOOOCUS_URL);
    gradioUrl.searchParams.set('token', token);
    gradioUrl.searchParams.set('user', tokenData.userId);
    gradioUrl.searchParams.set('module', tokenData.moduleTitle);
    
    return NextResponse.redirect(gradioUrl.toString());
    
  } catch (error) {
    console.error('❌ Erreur dans le proxy Gradio sécurisé:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token depuis les headers ou le body
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Essayer de récupérer depuis le body
      const body = await request.json().catch(() => ({}));
      token = body.token;
    }
    
    if (!token) {
      console.log('❌ Accès POST Gradio refusé - Pas de token');
      
      return NextResponse.json(
        { error: 'Token requis pour accéder à Gradio' },
        { status: 401 }
      );
    }
    
    // Vérifier le token
    const tokenData = verifyGradioToken(token);
    
    if (!tokenData) {
      console.log('❌ Accès POST Gradio refusé - Token invalide');
      
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    // Vérifier si le token n'a pas expiré
    const now = Math.floor(Date.now() / 1000);
    if (tokenData.expiresAt < now) {
      console.log(`❌ Accès POST Gradio refusé - Token expiré pour utilisateur ${tokenData.userId}`);
      
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      );
    }
    
    console.log(`✅ Accès POST Gradio autorisé pour utilisateur ${tokenData.userId} - Module: ${tokenData.moduleTitle}`);
    
    // Récupérer le body de la requête
    const body = await request.text();
    
    // Transférer la requête vers Gradio
    const response = await fetch(RUINEDFOOOCUS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
        'Authorization': `Bearer ${token}`, // Transmettre le token à Gradio
      },
      body: body,
    });
    
    // Retourner la réponse
    const responseData = await response.text();
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur dans le proxy POST Gradio sécurisé:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

