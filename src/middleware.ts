import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/stablediffusion-proxy',
  '/stablediffusion-direct',
  '/stablediffusion-iframe',
  '/stablediffusion-iframe-secure',
  '/stablediffusion-simple',
  '/stablediffusion-redirect',
  '/simple-stablediffusion',
  '/module',
  '/modules-access',
  '/secure-access'
];

// Routes API protégées
const protectedApiRoutes = [
  '/api/stablediffusion-proxy',
  '/api/direct-stablediffusion',
  '/api/proxy-stablediffusion',
  '/api/module-access',
  '/api/secure-proxy'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔐 Middleware - Vérification de la route:', pathname);

  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute && !isProtectedApiRoute) {
    console.log('✅ Route non protégée, accès autorisé');
    return NextResponse.next();
  }

  console.log('🔒 Route protégée détectée, vérification de l\'authentification...');

  // Récupérer le token d'authentification
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  
  let session = null;
  let user = null;

  // Essayer de récupérer la session depuis les cookies
  if (cookieHeader) {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      session = currentSession;
      user = currentSession?.user || null;
    } catch (error) {
      console.log('❌ Erreur lors de la récupération de la session:', error);
    }
  }

  // Si pas de session, vérifier le token d'accès dans l'URL
  if (!session && !user) {
    const url = new URL(request.url);
    const accessToken = url.searchParams.get('token');
    
    if (accessToken) {
      console.log('🔍 Token d\'accès trouvé dans l\'URL');
      try {
        // Valider le token d'accès (magic link)
        const response = await fetch(`${request.nextUrl.origin}/api/validate-magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: accessToken }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Token d\'accès valide:', data);
          
          // Ajouter les informations d'authentification aux headers
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-user-id', data.magicLinkData.userId);
          requestHeaders.set('x-module-name', data.magicLinkData.moduleName);
          requestHeaders.set('x-access-token', accessToken);
          
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        } else {
          console.log('❌ Token d\'accès invalide');
        }
      } catch (error) {
        console.log('❌ Erreur lors de la validation du token:', error);
      }
    }
  }

  // Si pas d'authentification valide, rediriger vers la page de connexion
  if (!session && !user) {
    console.log('❌ Aucune authentification valide, redirection vers login');
    
    if (isProtectedApiRoute) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier les abonnements pour les modules payants
  if (user && isProtectedRoute) {
    const moduleName = getModuleNameFromPath(pathname);
    if (moduleName) {
      console.log('🔍 Vérification de l\'abonnement pour le module:', moduleName);
      
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/check-subscription?module=${moduleName}&userId=${user.id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (!data.hasActiveSubscription) {
            console.log('❌ Aucun abonnement actif pour le module:', moduleName);
            
            if (isProtectedApiRoute) {
              return NextResponse.json(
                { error: 'Abonnement requis pour accéder à ce module' },
                { status: 403 }
              );
            }

            const subscriptionUrl = new URL('/abonnements', request.url);
            subscriptionUrl.searchParams.set('module', moduleName);
            return NextResponse.redirect(subscriptionUrl);
          }
        }
      } catch (error) {
        console.log('❌ Erreur lors de la vérification de l\'abonnement:', error);
      }
    }
  }

  console.log('✅ Authentification et autorisation validées');
  return NextResponse.next();
}

function getModuleNameFromPath(pathname: string): string | null {
  if (pathname.includes('module')) return 'module';
  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 