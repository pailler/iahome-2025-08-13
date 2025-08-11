import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sign, verify } from 'jsonwebtoken';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Clé secrète pour les tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Adresses locales autorisées
const ALLOWED_LOCAL_ADDRESSES = [
  'http://192.168.1.150:7870',
  'http://192.168.1.100:8080',
  'http://192.168.1.200:3000',
  'http://localhost:7870',
  'http://127.0.0.1:7870'
];

// IPs autorisées pour l'accès
const ALLOWED_IPS = [
  '90.90.226.59', // Votre IP principale
  '127.0.0.1',    // Localhost
  '::1',          // IPv6 localhost
  'localhost'     // Localhost
];

// Interface pour le token local
interface LocalToken {
  userId: string;
  targetUrl: string;
  moduleTitle: string;
  expiresAt: number;
  ip: string;
  issuedAt: number;
}

// Fonction pour vérifier un token local
function verifyLocalToken(token: string): LocalToken | null {
  try {
    const decoded = verify(token, JWT_SECRET) as LocalToken;
    return decoded;
  } catch (error) {
    console.error('❌ Token local invalide:', error);
    return null;
  }
}

// Fonction pour réécrire le HTML (remplace les URLs relatives)
function rewriteHtml(html: string, baseUrl: string, proxyPath: string): string {
  let modified = html;
  
  // Remplacer les URLs relatives par des URLs proxy
  modified = modified.replace(/href="\/([^"]*)"/g, `href="${proxyPath}/$1"`);
  modified = modified.replace(/src="\/([^"]*)"/g, `src="${proxyPath}/$1"`);
  modified = modified.replace(/action="\/([^"]*)"/g, `action="${proxyPath}/$1"`);
  
  // Remplacer les URLs absolues vers l'adresse locale
  const urlObj = new URL(baseUrl);
  const localDomain = `${urlObj.protocol}//${urlObj.host}`;
  
  modified = modified.replace(new RegExp(localDomain, 'g'), '');
  
  return modified;
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les paramètres de requête
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const targetPath = searchParams.get('path') || '';
    
    if (!token) {
      console.log('❌ Accès local refusé - Pas de token');
      
      return NextResponse.json(
        { error: 'Token requis pour accéder à la ressource locale' },
        { status: 401 }
      );
    }
    
    // Vérifier le token
    const tokenData = verifyLocalToken(token);
    
    if (!tokenData) {
      console.log('❌ Accès local refusé - Token invalide');
      
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    // Vérifier si le token n'a pas expiré
    const now = Math.floor(Date.now() / 1000);
    if (tokenData.expiresAt < now) {
      console.log(`❌ Accès local refusé - Token expiré pour utilisateur ${tokenData.userId}`);
      
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      );
    }
    
    // Vérifier l'IP (optionnel)
        const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
    
    if (tokenData.ip !== clientIP) {
      console.log(`⚠️  IP différente: Token=${tokenData.ip}, Client=${clientIP}`);
    }
    
    console.log(`✅ Accès local autorisé pour utilisateur ${tokenData.userId} - URL: ${tokenData.targetUrl}`);
    
    // Construire l'URL cible
    const targetUrl = new URL(targetPath, tokenData.targetUrl);
    
    // Vérifier que l'URL cible est autorisée
    const isAllowed = ALLOWED_LOCAL_ADDRESSES.some(allowed => 
      targetUrl.href.startsWith(allowed)
    );
    
    if (!isAllowed) {
      console.log(`❌ Accès refusé - URL non autorisée: ${targetUrl.href}`);
      
      return NextResponse.json(
        { error: 'URL locale non autorisée' },
        { status: 403 }
      );
    }
    
    // Faire la requête vers l'adresse locale
    const response = await fetch(targetUrl.href, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
        'Accept': request.headers.get('accept') || '*/*',
      },
    });
    
    if (!response.ok) {
      console.log(`❌ Erreur de la ressource locale: ${response.status}`);
      
      return NextResponse.json(
        { error: `Erreur de la ressource locale: ${response.status}` },
        { status: response.status }
      );
    }
    
    // Récupérer le contenu
    const contentType = response.headers.get('content-type') || '';
    const content = await response.text();
    
    // Si c'est du HTML, le réécrire
    if (contentType.includes('text/html')) {
      const proxyPath = `/api/local-proxy?token=${token}`;
      const rewrittenContent = rewriteHtml(content, tokenData.targetUrl, proxyPath);
      
      return new NextResponse(rewrittenContent, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'X-Proxy-By': 'IAHome-Local-Proxy',
        },
      });
    }
    
    // Pour les autres types de contenu, retourner tel quel
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Local-Proxy',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur dans le proxy local:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token depuis les headers ou les paramètres
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const targetPath = searchParams.get('path') || '';
    
    const authHeader = request.headers.get('authorization');
    let finalToken = token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      finalToken = authHeader.substring(7);
    }
    
    if (!finalToken) {
      console.log('❌ Accès POST local refusé - Pas de token');
      
      return NextResponse.json(
        { error: 'Token requis pour accéder à la ressource locale' },
        { status: 401 }
      );
    }
    
    // Vérifier le token
    const tokenData = verifyLocalToken(finalToken);
    
    if (!tokenData) {
      console.log('❌ Accès POST local refusé - Token invalide');
      
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
    
    // Vérifier si le token n'a pas expiré
    const now = Math.floor(Date.now() / 1000);
    if (tokenData.expiresAt < now) {
      console.log(`❌ Accès POST local refusé - Token expiré pour utilisateur ${tokenData.userId}`);
      
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 401 }
      );
    }
    
    console.log(`✅ Accès POST local autorisé pour utilisateur ${tokenData.userId} - URL: ${tokenData.targetUrl}`);
    
    // Construire l'URL cible
    const targetUrl = new URL(targetPath, tokenData.targetUrl);
    
    // Vérifier que l'URL cible est autorisée
    const isAllowed = ALLOWED_LOCAL_ADDRESSES.some(allowed => 
      targetUrl.href.startsWith(allowed)
    );
    
    if (!isAllowed) {
      console.log(`❌ Accès POST refusé - URL non autorisée: ${targetUrl.href}`);
      
      return NextResponse.json(
        { error: 'URL locale non autorisée' },
        { status: 403 }
      );
    }
    
    // Récupérer le body de la requête
    const body = await request.text();
    
    // Faire la requête POST vers l'adresse locale
    const response = await fetch(targetUrl.href, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body: body,
    });
    
    // Récupérer la réponse
    const responseData = await response.text();
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Proxy-By': 'IAHome-Local-Proxy',
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur dans le proxy POST local:', error);
    
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

