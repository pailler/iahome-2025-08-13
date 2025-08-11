import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken, hasPermission } from '../../../utils/accessToken';

// Configuration du module Metube
const METUBE_CONFIG = {
  url: 'http://iahome-metube:8081', // URL interne du module Metube (nom du service Docker)
  externalUrl: 'http://localhost:6400', // URL externe accessible depuis le navigateur
  credentials: {
    username: process.env.METUBE_USERNAME || 'admin',
    password: process.env.METUBE_PASSWORD || 'password'
  },
  authMethods: ['basic-auth', 'form-injection', 'cookie-session', 'direct-login']
};

// Fonction pour réécrire les URLs dans le HTML de Metube
function rewriteMetubeUrls(html: string): string {
  console.log('🔧 Début réécriture URLs Metube');
  let modifiedHtml = html;
  
  // Éviter la double réécriture en vérifiant si l'URL contient déjà /api/proxy-metube/static/
  const isAlreadyRewritten = (url: string) => url.includes('/api/proxy-metube/static/');
  
  // Remplacer les chemins relatifs pour les ressources statiques via le proxy
  modifiedHtml = modifiedHtml.replace(/href="([^"]*\.css[^"]*)"/g, (match, path) => {
    if (path.startsWith('http') || isAlreadyRewritten(path)) return match;
    return `href="/api/proxy-metube/static/${path}"`;
  });
  
  modifiedHtml = modifiedHtml.replace(/src="([^"]*\.js[^"]*)"/g, (match, path) => {
    if (path.startsWith('http') || isAlreadyRewritten(path)) return match;
    console.log(`🔧 Réécriture JS: ${path} -> /api/proxy-metube/static/${path}`);
    return `src="/api/proxy-metube/static/${path}"`;
  });
  
  modifiedHtml = modifiedHtml.replace(/src="([^"]*\.png[^"]*)"/g, (match, path) => {
    if (path.startsWith('http') || isAlreadyRewritten(path)) return match;
    return `src="/api/proxy-metube/static/${path}"`;
  });
  
  modifiedHtml = modifiedHtml.replace(/src="([^"]*\.jpg[^"]*)"/g, (match, path) => {
    if (path.startsWith('http') || isAlreadyRewritten(path)) return match;
    return `src="/api/proxy-metube/static/${path}"`;
  });
  
  modifiedHtml = modifiedHtml.replace(/src="([^"]*\.svg[^"]*)"/g, (match, path) => {
    if (path.startsWith('http') || isAlreadyRewritten(path)) return match;
    return `src="/api/proxy-metube/static/${path}"`;
  });
  
  modifiedHtml = modifiedHtml.replace(/src="([^"]*\.ico[^"]*)"/g, (match, path) => {
    if (path.startsWith('http') || isAlreadyRewritten(path)) return match;
    return `src="/api/proxy-metube/static/${path}"`;
  });
  
  // Remplacer les chemins relatifs pour les liens génériques (plus restrictif)
  modifiedHtml = modifiedHtml.replace(/href="([^"]*)"/g, (match, path) => {
    if (path.startsWith('http') || path.startsWith('#') || path.startsWith('mailto:') || isAlreadyRewritten(path)) return match;
    // Ne réécrire que les chemins qui semblent être des ressources
    if (path.includes('.') && !path.startsWith('/')) {
      return `href="/api/proxy-metube/static/${path}"`;
    }
    // Cas Metube API internes (ex: /api/add, /api/jobs)
    if (path.startsWith('/api/')) {
      return `href="/api/proxy-metube${path}"`;
    }
    return match;
  });
  
  modifiedHtml = modifiedHtml.replace(/action="([^"]*)"/g, (match, path) => {
    if (path.startsWith('http') || isAlreadyRewritten(path)) return match;
    // Form actions vers API Metube (gère absolu et relatif)
    if (path.startsWith('/api/')) {
      return `action="/api/proxy-metube${path}"`;
    }
    if (path.startsWith('api/')) {
      return `action="/api/proxy-metube/${path}"`;
    }
    if (path.startsWith('./api/')) {
      return `action="/api/proxy-metube/${path.slice(2)}"`;
    }
    if (path.startsWith('../api/')) {
      return `action="/api/proxy-metube/${path.replace(/^\.\.\//, '')}"`;
    }
    return `action="/api/proxy-metube/static/${path}"`;
  });

  // Réécriture fetch/XMLHttpRequest côté client (URLs absolues /api/...)
  modifiedHtml = modifiedHtml.replace(/fetch\(\s*['\"](\/api\/[^'\"]+)['\"]/g, (m, p) => `fetch('/api/proxy-metube${p}'`);
  // fetch vers chemins relatifs "api/...", "./api/...", "../api/..."
  modifiedHtml = modifiedHtml.replace(/fetch\(\s*['\"]((?:\.{0,2}\/)?api\/[^'\"]+)['\"]/g, (m, p) => {
    const normalized = p.replace(/^\.\/?/, '').replace(/^\.\.\//, '');
    return `fetch('/api/proxy-metube/${normalized}'`;
  });
  modifiedHtml = modifiedHtml.replace(/url:\s*['\"](\/api\/[^'\"]+)['\"]/g, (m, p) => `url: '/api/proxy-metube${p}'`);
  modifiedHtml = modifiedHtml.replace(/url:\s*['\"]((?:\.{0,2}\/)?api\/[^'\"]+)['\"]/g, (m, p) => {
    const normalized = p.replace(/^\.\/?/, '').replace(/^\.\.\//, '');
    return `url: '/api/proxy-metube/${normalized}'`;
  });
  
  console.log('🔧 Fin réécriture URLs Metube');
  // Injection d'un pont fetch/XHR pour réécrire dynamiquement les appels '/api/...'
  const bridgeScript = `
    <script>
      (function() {
        try {
          document.cookie = 'metube_upstream=' + encodeURIComponent(document.cookie) + '; path=/';
          const originalFetch = window.fetch;
          window.fetch = function(input, init) {
            try {
              const url = typeof input === 'string' ? input : (input && input.url) || '';
              if (typeof url === 'string') {
                if (url.startsWith('/api/')) input = '/api/proxy-metube' + url;
                else if (url.startsWith('api/')) input = '/api/proxy-metube/' + url;
                else if (url.startsWith('./api/')) input = '/api/proxy-metube/' + url.slice(2);
                else if (url.startsWith('../api/')) input = '/api/proxy-metube/' + url.replace(/^\.\.\//, '');
              }
            } catch (e) { console.debug('fetch bridge error', e); }
            return originalFetch.apply(this, arguments);
          };
          const origOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url) {
            try {
              if (typeof url === 'string') {
                if (url.startsWith('/api/')) url = '/api/proxy-metube' + url;
                else if (url.startsWith('api/')) url = '/api/proxy-metube/' + url;
                else if (url.startsWith('./api/')) url = '/api/proxy-metube/' + url.slice(2);
                else if (url.startsWith('../api/')) url = '/api/proxy-metube/' + url.replace(/^\.\.\//, '');
              }
            } catch (e) { console.debug('xhr bridge error', e); }
            return origOpen.apply(this, [method, url]);
          };
        } catch (e) { console.debug('bridge install error', e); }
      })();
    </script>`;
  return modifiedHtml.replace('</head>', bridgeScript + '</head>');
}

// Fonction pour tester l'accessibilité du module Metube
async function testMetubeAccess(): Promise<{ accessible: boolean; status: number; content?: string; setCookie?: string | null }> {
  try {
    console.log('🔍 Test d\'accessibilité Metube sur:', METUBE_CONFIG.url);
    
    const response = await fetch(METUBE_CONFIG.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Metube-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });

    const content = await response.text();
    const setCookie = response.headers.get('set-cookie');
    
    console.log(`📡 Réponse Metube: ${response.status} - ${response.statusText}`);
    
    // Réécrire les URLs dans le contenu
    const rewrittenContent = rewriteMetubeUrls(content);
    
    return {
      accessible: response.ok,
      status: response.status,
      content: rewrittenContent,
      setCookie
    };
  } catch (error) {
    console.error('❌ Erreur d\'accès à Metube:', error);
    return {
      accessible: false,
      status: 0,
      setCookie: null
    };
  }
}

// Fonction pour authentifier automatiquement l'utilisateur sur Metube
async function authenticateMetubeUser(token: string): Promise<{ success: boolean; method: string; html?: string; error?: string; setCookie?: string | null }> {
  try {
    console.log('🔐 Tentative d\'authentification Metube pour le token:', token);
    
    // Valider le token d'accès
    const accessData = await validateAccessToken(token);
    if (!accessData) {
      console.error('❌ Token invalide ou expiré:', token);
      return { success: false, method: 'token-validation', error: 'Token invalide ou expiré' };
    }

    // Vérifier les permissions
    if (!hasPermission(accessData, 'access')) {
      console.error('❌ Permissions insuffisantes pour le token:', token);
      return { success: false, method: 'permissions', error: 'Permissions insuffisantes' };
    }

    // Test d'accès initial
    const initialTest = await testMetubeAccess();
    console.log(`📡 Test initial Metube: ${initialTest.status} - ${initialTest.accessible ? 'Accessible' : 'Non accessible'}`);

    // Si déjà accessible, retourner directement
    if (initialTest.accessible) {
      console.log('✅ Metube déjà accessible sans authentification');
      return { 
        success: true, 
        method: 'no-auth-required', 
        html: initialTest.content,
        setCookie: initialTest.setCookie || null
      };
    }

    // Méthode 1: Authentification Basic HTTP
    try {
      console.log('🔐 Tentative Basic Auth pour Metube...');
      
      const credentials = Buffer.from(`${METUBE_CONFIG.credentials.username}:${METUBE_CONFIG.credentials.password}`).toString('base64');
      
      const headers = new Headers();
      headers.set('Authorization', `Basic ${credentials}`);
      headers.set('User-Agent', 'IAHome-Metube-Proxy/1.0');
      headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
      headers.set('Accept-Language', 'fr-FR,fr;q=0.9,en;q=0.8');
      headers.set('Cache-Control', 'no-cache');

      const basicAuthResponse = await fetch(METUBE_CONFIG.url, {
        method: 'GET',
        headers: headers
      });
      
       if (basicAuthResponse.ok) {
         const html = await basicAuthResponse.text();
         const rewrittenHtml = rewriteMetubeUrls(html);
         const setCookie = basicAuthResponse.headers.get('set-cookie');
         console.log('✅ Authentification Basic réussie pour Metube');
         return { success: true, method: 'basic-auth', html: rewrittenHtml, setCookie };
       } else {
        console.log(`❌ Basic Auth échoué pour Metube: ${basicAuthResponse.status}`);
      }
    } catch (error) {
      console.log('❌ Erreur Basic Auth pour Metube:', error);
    }

    // Méthode 2: Connexion directe via POST
    try {
      console.log('🔐 Tentative connexion directe pour Metube...');
      
      // Première requête pour obtenir les cookies et le formulaire
      const initialResponse = await fetch(METUBE_CONFIG.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Metube-Proxy/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (initialResponse.ok) {
        const html = await initialResponse.text();
        const cookies = initialResponse.headers.get('set-cookie');
        
        // Construire le body de connexion
        const loginData = new URLSearchParams();
        loginData.append('username', METUBE_CONFIG.credentials.username);
        loginData.append('password', METUBE_CONFIG.credentials.password);
        
        // Tentative de connexion POST
        const loginResponse = await fetch(METUBE_CONFIG.url, {
          method: 'POST',
          headers: {
            'User-Agent': 'IAHome-Metube-Proxy/1.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies || '',
            'Referer': METUBE_CONFIG.url
          },
          body: loginData.toString(),
          redirect: 'follow'
        });

                 if (loginResponse.ok) {
           const loginContent = await loginResponse.text();
           const rewrittenContent = rewriteMetubeUrls(loginContent);
           const setCookie = loginResponse.headers.get('set-cookie');
           console.log('✅ Connexion directe réussie pour Metube');
           return { success: true, method: 'direct-login', html: rewrittenContent, setCookie };
         } else {
          console.log(`❌ Connexion directe échouée pour Metube: ${loginResponse.status}`);
        }
      }
    } catch (error) {
      console.log('❌ Erreur connexion directe pour Metube:', error);
    }

    // Méthode 3: Injection de formulaire avec JavaScript
    try {
      console.log('🔐 Tentative injection de formulaire pour Metube...');
      
      const response = await fetch(METUBE_CONFIG.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Metube-Proxy/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

             if (response.ok) {
             const html = await response.text();
         const rewrittenHtml = rewriteMetubeUrls(html);
         
         // Script d'injection automatique
        const injectionScript = `
        <script>
          (function() {
            console.log('🔐 [IAHOME] Démarrage injection automatique pour Metube...');
            console.log('🔐 [IAHOME] Credentials: ${METUBE_CONFIG.credentials.username} / ${METUBE_CONFIG.credentials.password}');
            
            let attempts = 0;
            const maxAttempts = 10;
            let success = false;
            
            function log(message, type = 'info') {
              const timestamp = new Date().toISOString();
              const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
              console.log(\`\${prefix} [IAHOME] [\${timestamp}] \${message}\`);
              
              // Ajouter au DOM pour debug
              const debugDiv = document.getElementById('iahome-debug') || createDebugDiv();
              debugDiv.innerHTML += \`<div class="\${type}">\${prefix} \${message}</div>\`;
            }
            
            function createDebugDiv() {
              const div = document.createElement('div');
              div.id = 'iahome-debug';
              div.style.cssText = 'position:fixed;top:10px;right:10px;width:400px;max-height:300px;overflow-y:auto;background:rgba(0,0,0,0.9);color:white;padding:10px;font-family:monospace;font-size:12px;z-index:9999;border-radius:5px;';
              div.innerHTML = '<div style="background:red;padding:5px;margin-bottom:10px;">🔐 IAHOME DEBUG - Metube Injection</div>';
              document.body.appendChild(div);
              return div;
            }
            
            function findAndFillForm() {
              if (success) return;
              
              attempts++;
              log(\`Tentative \${attempts}/\${maxAttempts}\`);
              
              // Recherche des champs de connexion
              const possibleUsernameSelectors = [
                'input[name="username"]',
                'input[name="user"]',
                'input[name="login"]',
                'input[name="email"]',
                'input[id="username"]',
                'input[id="user"]',
                'input[id="login"]',
                'input[type="text"]:not([name*="search"]):not([name*="email"])',
                'input[placeholder*="user" i]',
                'input[placeholder*="login" i]',
                'input[placeholder*="nom" i]',
                'input[autocomplete="username"]'
              ];
              
              const possiblePasswordSelectors = [
                'input[name="password"]',
                'input[name="pass"]',
                'input[name="pwd"]',
                'input[id="password"]',
                'input[id="pass"]',
                'input[id="pwd"]',
                'input[type="password"]',
                'input[placeholder*="pass" i]',
                'input[placeholder*="mot" i]',
                'input[autocomplete="current-password"]'
              ];
              
              let usernameField = null;
              let passwordField = null;
              
              // Chercher le champ username
              for (let selector of possibleUsernameSelectors) {
                usernameField = document.querySelector(selector);
                if (usernameField) {
                  log(\`Champ username trouvé: \${selector}\`);
                  break;
                }
              }
              
              // Chercher le champ password
              for (let selector of possiblePasswordSelectors) {
                passwordField = document.querySelector(selector);
                if (passwordField) {
                  log(\`Champ password trouvé: \${selector}\`);
                  break;
                }
              }
              
              // Si on a trouvé les deux champs
              if (usernameField && passwordField) {
                log('✅ Champs de connexion trouvés, remplissage...');
                
                try {
                  // Vider les champs d'abord
                  usernameField.value = '';
                  passwordField.value = '';
                  
                  // Remplir les champs
                  usernameField.value = '${METUBE_CONFIG.credentials.username}';
                  passwordField.value = '${METUBE_CONFIG.credentials.password}';
                  
                  log('Champs remplis avec succès');
                  
                  // Déclencher les événements
                  const events = ['input', 'change', 'blur', 'focus'];
                  events.forEach(eventType => {
                    usernameField.dispatchEvent(new Event(eventType, { bubbles: true }));
                    passwordField.dispatchEvent(new Event(eventType, { bubbles: true }));
                  });
                  
                  log('Événements déclenchés');
                  
                  // Trouver le formulaire et soumettre
                  const form = usernameField.closest('form') || passwordField.closest('form');
                  if (form) {
                    log('📝 Formulaire trouvé, soumission...');
                    setTimeout(() => {
                      form.submit();
                      success = true;
                    }, 1000);
                    return true;
                  } else {
                    log('❌ Aucun formulaire trouvé', 'error');
                  }
                } catch (e) {
                  log(\`Erreur lors du remplissage: \${e.message}\`, 'error');
                }
              } else {
                log(\`❌ Champs non trouvés - Username: \${!!usernameField}, Password: \${!!passwordField}\`, 'error');
              }
              
              // Continuer les tentatives
              if (attempts < maxAttempts && !success) {
                setTimeout(findAndFillForm, 2000);
              } else if (!success) {
                log(\`❌ Échec après \${maxAttempts} tentatives\`, 'error');
              }
              
              return false;
            }
            
            // Démarrer après chargement
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', findAndFillForm);
            } else {
              findAndFillForm();
            }
            
            // Tentatives supplémentaires
            setTimeout(findAndFillForm, 3000);
            setTimeout(findAndFillForm, 6000);
            setTimeout(findAndFillForm, 10000);
            
          })();
        </script>`;

                 const modifiedHtml = rewrittenHtml.replace('</head>', injectionScript + '</head>');
         
         const setCookie = response.headers.get('set-cookie');
         return { 
           success: true, 
           method: 'form-injection', 
           html: modifiedHtml,
           setCookie
         };
      }
    } catch (error) {
      console.log('❌ Erreur injection de formulaire pour Metube:', error);
    }

    // Si aucune méthode n'a fonctionné
    console.log('❌ Aucune méthode d\'authentification n\'a fonctionné pour Metube');
    
    const diagnosticHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Diagnostic - Metube</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .info { color: #1976d2; background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .success { color: #388e3c; background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .test-btn { background: #2196f3; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 5px; }
          .test-btn:hover { background: #1976d2; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Diagnostic d'Authentification - Metube</h1>
          
          <div class="error">
            <h2>❌ Échec de l'authentification automatique</h2>
            <p>Aucune méthode d'authentification n'a fonctionné pour accéder à <strong>${METUBE_CONFIG.url}</strong></p>
          </div>
          
          <div class="info">
            <h3>📋 Informations de diagnostic :</h3>
            <ul>
              <li><strong>Module :</strong> Metube</li>
              <li><strong>URL :</strong> ${METUBE_CONFIG.url}</li>
              <li><strong>Username :</strong> ${METUBE_CONFIG.credentials.username}</li>
              <li><strong>Méthodes testées :</strong> ${METUBE_CONFIG.authMethods.join(', ')}</li>
              <li><strong>Statut initial :</strong> ${initialTest.status}</li>
            </ul>
          </div>
          
          <div class="success">
            <h3>🛠️ Solutions possibles :</h3>
            <ol>
              <li>Vérifiez que Metube est accessible sur le port 6400</li>
              <li>Vérifiez les credentials (username/password)</li>
              <li>Essayez d'accéder manuellement à l'application</li>
              <li>Vérifiez la configuration du module</li>
            </ol>
          </div>
          
          <div>
            <h3>🧪 Tests rapides :</h3>
            <button class="test-btn" onclick="testDirectAccess()">Test Accès Direct</button>
            <button class="test-btn" onclick="testBasicAuth()">Test Basic Auth</button>
            <button class="test-btn" onclick="window.open('${METUBE_CONFIG.url}', '_blank')">Ouvrir dans un nouvel onglet</button>
          </div>
          
          <div id="test-results"></div>
        </div>
        
        <script>
          async function testDirectAccess() {
            const results = document.getElementById('test-results');
            results.innerHTML = '<p>Test en cours...</p>';
            
            try {
              const response = await fetch('${METUBE_CONFIG.url}');
              results.innerHTML = '<p class="success">✅ Accès direct : ' + response.status + '</p>';
            } catch (error) {
              results.innerHTML = '<p class="error">❌ Erreur accès direct : ' + error.message + '</p>';
            }
          }
          
          async function testBasicAuth() {
            const results = document.getElementById('test-results');
            results.innerHTML = '<p>Test Basic Auth en cours...</p>';
            
            try {
              const credentials = btoa('${METUBE_CONFIG.credentials.username}:${METUBE_CONFIG.credentials.password}');
              const response = await fetch('${METUBE_CONFIG.url}', {
                headers: {
                  'Authorization': 'Basic ' + credentials
                }
              });
              results.innerHTML = '<p class="success">✅ Basic Auth : ' + response.status + '</p>';
            } catch (error) {
              results.innerHTML = '<p class="error">❌ Erreur Basic Auth : ' + error.message + '</p>';
            }
          }
        </script>
      </body>
      </html>
    `;

    return { 
      success: false, 
      method: 'diagnostic', 
      html: diagnosticHtml 
    };
  } catch (error) {
    console.error('❌ Erreur authentification Metube:', error);
    return { 
      success: false, 
      method: 'error', 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url);

    // Rediriger l'entrée principale vers la page proxifiée transparente
    if (pathname === '/api/proxy-metube') {
      return NextResponse.redirect(new URL('/api/proxy-metube/page', request.url));
    }
    const token = searchParams.get('token');
    const action = searchParams.get('action') || 'proxy';

    console.log('🔐 Accès Metube GET demandé:', { token: token ? 'présent' : 'manquant', action });

    // Pour Metube, permettre l'accès sans token (module gratuit)
    if (!token) {
      console.log('⚠️ Accès Metube sans token - module gratuit');
      
      // Test d'accès direct à Metube
      const testResult = await testMetubeAccess();
      if (testResult.accessible && testResult.content) {
        const res = new NextResponse(testResult.content, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
            'X-Proxy-By': 'IAHome-Metube-Proxy',
            'X-Auth-Method': 'free-module-access'
          },
        });
        if ((testResult as any).setCookie) {
          res.headers.append('Set-Cookie', `metube_bridge=${encodeURIComponent((testResult as any).setCookie)}; Path=/api/proxy-metube; SameSite=None; Secure`);
        }
        return res;
      } else {
        return NextResponse.json(
          { error: 'Metube non accessible' },
          { status: 503 }
        );
      }
    }

    if (action === 'test') {
      // Test simple d'accessibilité
      const testResult = await testMetubeAccess();
      return NextResponse.json({
        accessible: testResult.accessible,
        status: testResult.status,
        url: METUBE_CONFIG.url
      });
    }

    if (action === 'auth') {
      // Authentification avec token
      const authResult = await authenticateMetubeUser(token);
      
      if (authResult.success && authResult.html) {
        const res = new NextResponse(authResult.html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
            'X-Proxy-By': 'IAHome-Metube-Proxy',
            'X-Auth-Method': authResult.method
          },
        });
        if ((authResult as any).setCookie) {
          res.headers.append('Set-Cookie', `metube_bridge=${encodeURIComponent((authResult as any).setCookie)}; Path=/api/proxy-metube; SameSite=None; Secure`);
        }
        return res;
      } else {
        return NextResponse.json(
          { error: authResult.error || 'Échec de l\'authentification' },
          { status: 403 }
        );
      }
    }

    // Action par défaut: proxy simple
    const authResult = await authenticateMetubeUser(token);
    
    if (authResult.success && authResult.html) {
      const res = new NextResponse(authResult.html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
          'X-Proxy-By': 'IAHome-Metube-Proxy',
          'X-Auth-Method': authResult.method
        },
      });
      if ((authResult as any).setCookie) {
        res.headers.append('Set-Cookie', `metube_bridge=${encodeURIComponent((authResult as any).setCookie)}; Path=/api/proxy-metube; SameSite=None; Secure`);
      }
      return res;
    } else {
      return NextResponse.json(
        { error: authResult.error || 'Échec de l\'authentification' },
        { status: 403 }
      );
    }

  } catch (error) {
    console.error('❌ Erreur proxy Metube GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action = 'proxy' } = body;

    console.log('🔐 Accès Metube POST demandé:', { token: token ? 'présent' : 'manquant', action });

    // Pour Metube, permettre l'accès sans token (module gratuit)
    if (!token) {
      console.log('⚠️ Accès Metube POST sans token - module gratuit');
      
      // Test d'accès direct à Metube
      const testResult = await testMetubeAccess();
      if (testResult.accessible && testResult.content) {
        const res = new NextResponse(testResult.content, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
            'X-Proxy-By': 'IAHome-Metube-Proxy',
            'X-Auth-Method': 'free-module-access'
          },
        });
        if ((testResult as any).setCookie) {
          res.headers.append('Set-Cookie', `metube_bridge=${encodeURIComponent((testResult as any).setCookie)}; Path=/api/proxy-metube; SameSite=None; Secure`);
        }
        return res;
      } else {
        return NextResponse.json(
          { error: 'Metube non accessible' },
          { status: 503 }
        );
      }
    }

    if (action === 'test') {
      // Test simple d'accessibilité
      const testResult = await testMetubeAccess();
      return NextResponse.json({
        accessible: testResult.accessible,
        status: testResult.status,
        url: METUBE_CONFIG.url
      });
    }

    // Authentification avec token
    const authResult = await authenticateMetubeUser(token);
    
    if (authResult.success && authResult.html) {
      const res = new NextResponse(authResult.html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
          'X-Proxy-By': 'IAHome-Metube-Proxy',
          'X-Auth-Method': authResult.method
        },
      });
      if ((authResult as any).setCookie) {
        res.headers.append('Set-Cookie', `metube_bridge=${encodeURIComponent((authResult as any).setCookie)}; Path=/api/proxy-metube; SameSite=None; Secure`);
      }
      return res;
    } else {
      return NextResponse.json(
        { error: authResult.error || 'Échec de l\'authentification' },
        { status: 403 }
      );
    }

  } catch (error) {
    console.error('❌ Erreur proxy Metube POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}


