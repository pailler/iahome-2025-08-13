import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { validateMagicLink } from '../../../utils/magicLink';

const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';
const STABLEDIFFUSION_CREDENTIALS = {
  username: 'admin',
  password: 'Rasulova75'
};

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Proxy Stable Diffusion demandé');

    // Vérifier l'authentification
    const userId = request.headers.get('x-user-id');
    const moduleName = request.headers.get('x-module-name');
    const accessToken = request.headers.get('x-access-token');

    console.log('🔍 Headers d\'authentification:', { userId, moduleName, accessToken: accessToken ? 'présent' : 'absent' });

    // Si pas d'authentification via headers, vérifier le token dans l'URL
    let authenticatedUser = null;
    let authenticatedModule = null;

    if (userId && moduleName) {
      authenticatedUser = userId;
      authenticatedModule = moduleName;
    } else {
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      
      if (token) {
        console.log('🔍 Token trouvé dans l\'URL, validation...');
        const magicLinkData = validateMagicLink(token);
        
        if (magicLinkData && magicLinkData.moduleName === 'stablediffusion') {
          authenticatedUser = magicLinkData.userId;
          authenticatedModule = magicLinkData.moduleName;
          console.log('✅ Token valide pour l\'utilisateur:', authenticatedUser);
        } else {
          console.log('❌ Token invalide ou module incorrect');
          return NextResponse.json(
            { error: 'Token d\'accès invalide ou expiré' },
            { status: 403 }
          );
        }
      } else {
        console.log('❌ Aucune authentification trouvée');
        return NextResponse.json(
          { error: 'Authentification requise pour accéder à Stable Diffusion' },
          { status: 401 }
        );
      }
    }

    // Vérifier l'abonnement actif
    if (authenticatedUser) {
      console.log('🔍 Vérification de l\'abonnement pour l\'utilisateur:', authenticatedUser);
      
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', authenticatedUser)
        .eq('module_name', 'stablediffusion')
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('❌ Erreur vérification abonnement:', subscriptionError);
        return NextResponse.json(
          { error: 'Erreur lors de la vérification de l\'abonnement' },
          { status: 500 }
        );
      }

      if (!subscriptionData) {
        console.log('⚠️ Aucun abonnement actif trouvé pour Stable Diffusion - Accès temporaire autorisé pour les tests');
        // Temporairement, permettre l'accès même sans abonnement pour les tests
      } else {
        console.log('✅ Abonnement valide trouvé:', subscriptionData);
      }
    }

    // Créer les headers avec authentification HTTP Basic
    const credentials = Buffer.from(`${STABLEDIFFUSION_CREDENTIALS.username}:${STABLEDIFFUSION_CREDENTIALS.password}`).toString('base64');
    
    const headers = new Headers();
    headers.set('Authorization', `Basic ${credentials}`);
    headers.set('User-Agent', 'IAHome-Proxy/1.0');

    // Faire la requête vers Stable Diffusion
    const response = await fetch(STABLEDIFFUSION_URL, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Réponse Stable Diffusion:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Erreur Stable Diffusion:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erreur Stable Diffusion: ${response.status}` },
        { status: response.status }
      );
    }

    // Récupérer le contenu HTML
    const html = await response.text();

    // Modifier le HTML pour masquer l'URL et injecter l'authentification automatique
    const modifiedHtml = html.replace(
      '</head>',
      `
      <script>
        // Masquer l'URL dans la barre d'adresse
        if (window.parent !== window) {
          // Nous sommes dans une iframe
          document.addEventListener('DOMContentLoaded', function() {
            // Masquer les éléments qui pourraient révéler l'URL
            const style = document.createElement('style');
            style.textContent = \`
              /* Masquer les éléments qui pourraient révéler l'URL */
              .header, .navbar, .breadcrumb, .url-display { display: none !important; }
              /* Améliorer l'apparence dans l'iframe */
              body { margin: 0; padding: 0; }
            \`;
            document.head.appendChild(style);
          });
        }

        // Injection automatique des credentials
        window.addEventListener('load', function() {
          setTimeout(function() {
            // Chercher les champs de formulaire
            const usernameInputs = document.querySelectorAll('input[name="username"], input[name="user"], input[type="text"]');
            const passwordInputs = document.querySelectorAll('input[name="password"], input[name="pass"], input[type="password"]');
            
            if (usernameInputs.length > 0 && passwordInputs.length > 0) {
              // Remplir les champs
              usernameInputs[0].value = 'admin';
              passwordInputs[0].value = 'Rasulova75';
              
              // Trouver et soumettre le formulaire
              const form = usernameInputs[0].closest('form') || passwordInputs[0].closest('form');
              if (form) {
                console.log('🔐 Authentification automatique...');
                setTimeout(function() {
                  form.submit();
                }, 500);
              }
            }
          }, 1000);
        });

        // Empêcher l'ouverture de nouveaux onglets/liens externes
        document.addEventListener('click', function(e) {
          const target = e.target.closest('a');
          if (target && target.href && !target.href.startsWith(window.location.origin)) {
            e.preventDefault();
            // Rediriger vers notre proxy si c'est un lien externe
            const newUrl = '/api/stablediffusion-proxy?token=' + new URLSearchParams(window.location.search).get('token') + '&redirect=' + encodeURIComponent(target.href);
            window.location.href = newUrl;
          }
        });
      </script>
      </head>
      `
    );

    console.log('✅ HTML modifié avec authentification automatique');

    // Retourner le HTML modifié
    return new NextResponse(modifiedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Proxy',
      },
    });

  } catch (error) {
    console.error('❌ Erreur proxy Stable Diffusion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 