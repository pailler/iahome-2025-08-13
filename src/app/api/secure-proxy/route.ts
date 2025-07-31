import { NextRequest, NextResponse } from 'next/server';

// Configuration des modules avec des IDs numériques pour masquer les URLs
const MODULES_CONFIG: Record<string, {
  id: number;
  url: string;
  credentials: { username: string; password: string };
  name: string;
}> = {
  '1': {
    id: 1,
    url: 'https://stablediffusion.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    name: 'Stable Diffusion'
  },
  '2': {
    id: 2,
    url: 'https://iatube.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    name: 'IA Tube'
  },
  '3': {
    id: 3,
    url: 'https://iametube.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    name: 'IA Metube'
  }
};

// Mapping des noms vers les IDs
const MODULE_NAMES: Record<string, string> = {
  'stablediffusion': '1',
  'iatube': '2',
  'iametube': '3'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('id');
    const moduleName = searchParams.get('module');

    console.log('🔐 Proxy sécurisé demandé:', { moduleId, moduleName });

    let targetModule: any = null;

    // Déterminer le module cible
    if (moduleId && MODULES_CONFIG[moduleId]) {
      targetModule = MODULES_CONFIG[moduleId];
    } else if (moduleName && MODULE_NAMES[moduleName]) {
      const id = MODULE_NAMES[moduleName];
      targetModule = MODULES_CONFIG[id];
    }

    if (!targetModule) {
      console.error('❌ Module non trouvé:', { moduleId, moduleName });
      return NextResponse.json(
        { error: 'Module non trouvé' },
        { status: 404 }
      );
    }

    console.log('🎯 Module cible:', targetModule.name);

    // Proxy avec authentification
    const credentials = Buffer.from(`${targetModule.credentials.username}:${targetModule.credentials.password}`).toString('base64');
    
    const headers = new Headers();
    headers.set('Authorization', `Basic ${credentials}`);
    headers.set('User-Agent', 'IAHome-Secure-Proxy/2.0');
    headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
    headers.set('Accept-Language', 'fr-FR,fr;q=0.9,en;q=0.8');
    headers.set('Accept-Encoding', 'gzip, deflate, br');
    headers.set('Connection', 'keep-alive');
    headers.set('Upgrade-Insecure-Requests', '1');

    const response = await fetch(targetModule.url, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Réponse module:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Erreur module:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erreur ${targetModule.name}: ${response.status}` },
        { status: response.status }
      );
    }

    // Récupérer le contenu HTML
    const html = await response.text();

    // Modifier le HTML pour injecter l'authentification automatique
    const modifiedHtml = html.replace(
      '</head>',
      `
      <script>
        // Injection automatique des credentials pour ${targetModule.name}
        window.addEventListener('load', function() {
          setTimeout(function() {
            // Chercher les champs de formulaire
            const usernameInputs = document.querySelectorAll('input[name="username"], input[name="user"], input[type="text"]');
            const passwordInputs = document.querySelectorAll('input[name="password"], input[name="pass"], input[type="password"]');
            
            if (usernameInputs.length > 0 && passwordInputs.length > 0) {
              // Remplir les champs
              usernameInputs[0].value = '${targetModule.credentials.username}';
              passwordInputs[0].value = '${targetModule.credentials.password}';
              
              // Trouver et soumettre le formulaire
              const form = usernameInputs[0].closest('form') || passwordInputs[0].closest('form');
              if (form) {
                console.log('🔐 Authentification automatique pour ${targetModule.name}...');
                setTimeout(function() {
                  form.submit();
                }, 500);
              }
            }
          }, 1000);
        });
      </script>
      </head>
      `
    );

    console.log('✅ HTML modifié avec authentification automatique pour', targetModule.name);

    // Retourner le HTML modifié
    return new NextResponse(modifiedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Proxy-By': 'IAHome-Secure-Proxy',
        'X-Module-Name': targetModule.name,
        'X-Module-ID': targetModule.id.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Erreur proxy sécurisé:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 