import { NextRequest, NextResponse } from 'next/server';

// Configuration des modules avec méthodes d'authentification
const MODULES_CONFIG: Record<string, {
  url: string;
  credentials: { username: string; password: string };
  type: string;
  authMethods: string[];
  loginForm?: {
    action?: string;
    usernameField?: string;
    passwordField?: string;
    submitButton?: string;
  };
  launchArgs?: {
    usernameArg?: string;
    passwordArg?: string;
    authArg?: string;
  };
}> = {
  stablediffusion: {
    url: 'https://stablediffusion.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    type: 'gradio',
    authMethods: ['gradio-auth', 'launch-args', 'gradio-injection', 'basic-auth', 'form-injection', 'cookie-session', 'direct-login'],
    loginForm: {
      usernameField: 'username',
      passwordField: 'password',
      submitButton: 'button[type="submit"]'
    },
    launchArgs: {
      usernameArg: '--gradio-auth',
      passwordArg: '--gradio-auth-path',
      authArg: '--auth'
    }
  },
  iatube: {
    url: 'https://iatube.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    type: 'http-basic',
    authMethods: ['basic-auth', 'form-injection', 'cookie-session', 'direct-login'],
    loginForm: {
      usernameField: 'username',
      passwordField: 'password'
    }
  },
  iametube: {
    url: 'https://iametube.regispailler.fr',
    credentials: { username: 'admin', password: 'Rasulova75' },
    type: 'http-basic',
    authMethods: ['basic-auth', 'form-injection', 'cookie-session', 'direct-login'],
    loginForm: {
      usernameField: 'username',
      passwordField: 'password'
    }
  }
};

// Fonction pour tester si une URL est accessible
async function testUrlAccess(url: string, headers?: Headers): Promise<{ accessible: boolean; status: number; content?: string }> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers || {
        'User-Agent': 'IAHome-Module-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });

    const content = await response.text();
    
    return {
      accessible: response.ok,
      status: response.status,
      content: content
    };
  } catch (error) {
    console.log(`❌ Erreur d'accès à ${url}:`, error);
    return {
      accessible: false,
      status: 0
    };
  }
}

// Fonction pour récupérer les credentials depuis les arguments de lancement
async function getCredentialsFromLaunchArgs(config: any): Promise<{ username: string; password: string } | null> {
  try {
    console.log(`🔍 Tentative de récupération des credentials depuis Launch Args...`);
    
    // Pour StableDiffusion, on peut essayer de récupérer depuis l'API ou les cookies
    if (config.type === 'gradio') {
      // Essayer de récupérer depuis l'API Gradio
      const gradioConfigUrl = `${config.url}/config`;
      
      const response = await fetch(gradioConfigUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Module-Proxy/1.0',
          'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (response.ok) {
        try {
          const configData = await response.json();
          console.log(`📋 Config Gradio récupérée:`, configData);
          
          // Chercher les credentials dans la config
          if (configData.auth && configData.auth.username && configData.auth.password) {
            return {
              username: configData.auth.username,
              password: configData.auth.password
            };
          }
        } catch (e) {
          console.log(`❌ Erreur parsing config Gradio:`, e);
        }
      }
      
      // Si pas de config, essayer de récupérer depuis les arguments de lancement via l'interface
      const mainPageResponse = await fetch(config.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Module-Proxy/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (mainPageResponse.ok) {
        const html = await mainPageResponse.text();
        
        // Chercher les arguments de lancement dans le HTML
        const launchArgsMatch = html.match(/--gradio-auth\s+([^\s]+)/);
        const authPathMatch = html.match(/--gradio-auth-path\s+([^\s]+)/);
        
        if (launchArgsMatch) {
          console.log(`🔍 Arguments de lancement trouvés: ${launchArgsMatch[1]}`);
          
          // Essayer de récupérer les credentials depuis le fichier d'auth
          if (authPathMatch) {
            const authFilePath = authPathMatch[1];
            console.log(`🔍 Fichier d'auth trouvé: ${authFilePath}`);
            
            // Pour l'instant, retourner les credentials par défaut
            // TODO: Implémenter la lecture du fichier d'auth
            return {
              username: 'admin',
              password: 'Rasulova75'
            };
          }
        }
      }
    }
    
    // Fallback: retourner les credentials par défaut
    console.log(`⚠️ Utilisation des credentials par défaut pour Launch Args`);
    return {
      username: config.credentials.username,
      password: config.credentials.password
    };
    
  } catch (error) {
    console.log(`❌ Erreur récupération Launch Args:`, error);
    return null;
  }
}

// Fonction pour outrepasser l'identification avec plusieurs méthodes
async function bypassAuthentication(module: string, method: string = 'auto') {
  const config = MODULES_CONFIG[module];
  if (!config) {
    throw new Error(`Module ${module} non configuré`);
  }

  console.log(`🔐 Tentative d'outrepassement pour ${module} avec méthode ${method}`);

  // Test d'accès initial sans authentification
  const initialTest = await testUrlAccess(config.url);
  console.log(`📡 Test initial ${module}: ${initialTest.status} - ${initialTest.accessible ? 'Accessible' : 'Non accessible'}`);

  // Si déjà accessible, retourner directement
  if (initialTest.accessible) {
    console.log(`✅ ${module} déjà accessible sans authentification`);
    return { 
      success: true, 
      method: 'no-auth-required', 
      html: initialTest.content 
    };
  }

  const credentials = Buffer.from(`${config.credentials.username}:${config.credentials.password}`).toString('base64');
  
  // Méthode 1: Authentification via Launch Arguments
  if (method === 'launch-args' || method === 'auto') {
    try {
      console.log(`🔐 Tentative authentification via Launch Args pour ${module}...`);
      
      // Récupérer les credentials depuis les arguments de lancement
      const launchCredentials = await getCredentialsFromLaunchArgs(config);
      
      if (launchCredentials) {
        console.log(`✅ Credentials récupérés depuis Launch Args: ${launchCredentials.username}`);
        
        // Utiliser les credentials des launch args pour l'authentification
        const launchAuthCredentials = Buffer.from(`${launchCredentials.username}:${launchCredentials.password}`).toString('base64');
        
        const headers = new Headers();
        headers.set('Authorization', `Basic ${launchAuthCredentials}`);
        headers.set('User-Agent', 'IAHome-Module-Proxy/1.0');
        headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
        headers.set('Accept-Language', 'fr-FR,fr;q=0.9,en;q=0.8');
        headers.set('Cache-Control', 'no-cache');

        const launchArgsTest = await testUrlAccess(config.url, headers);
        
        if (launchArgsTest.accessible) {
          console.log(`✅ Authentification Launch Args réussie pour ${module}`);
          return { success: true, method: 'launch-args', html: launchArgsTest.content };
        } else {
          console.log(`❌ Launch Args Auth échoué pour ${module}: ${launchArgsTest.status}`);
        }
      } else {
        console.log(`❌ Impossible de récupérer les credentials depuis Launch Args pour ${module}`);
      }
    } catch (error) {
      console.log(`❌ Erreur Launch Args Auth pour ${module}:`, error);
    }
  }

  // Méthode 2: Authentification Basic HTTP
  if (method === 'basic-auth' || method === 'auto') {
    try {
      console.log(`🔐 Tentative Basic Auth pour ${module}...`);
      
      const headers = new Headers();
      headers.set('Authorization', `Basic ${credentials}`);
      headers.set('User-Agent', 'IAHome-Module-Proxy/1.0');
      headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
      headers.set('Accept-Language', 'fr-FR,fr;q=0.9,en;q=0.8');
      headers.set('Cache-Control', 'no-cache');

      const basicAuthTest = await testUrlAccess(config.url, headers);
      
      if (basicAuthTest.accessible) {
        console.log(`✅ Authentification Basic réussie pour ${module}`);
        return { success: true, method: 'basic-auth', html: basicAuthTest.content };
      } else {
        console.log(`❌ Basic Auth échoué pour ${module}: ${basicAuthTest.status}`);
      }
    } catch (error) {
      console.log(`❌ Erreur Basic Auth pour ${module}:`, error);
    }
  }

  // Méthode 2: Connexion directe via POST
  if (method === 'direct-login' || method === 'auto') {
    try {
      console.log(`🔐 Tentative connexion directe pour ${module}...`);
      
      // Première requête pour obtenir les cookies et le formulaire
      const initialResponse = await fetch(config.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Module-Proxy/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (initialResponse.ok) {
        const html = initialResponse.text();
        const cookies = initialResponse.headers.get('set-cookie');
        
        // Construire le body de connexion
        const loginData = new URLSearchParams();
        loginData.append(config.loginForm?.usernameField || 'username', config.credentials.username);
        loginData.append(config.loginForm?.passwordField || 'password', config.credentials.password);
        
        // Tentative de connexion POST
        const loginResponse = await fetch(config.url, {
          method: 'POST',
          headers: {
            'User-Agent': 'IAHome-Module-Proxy/1.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies || '',
            'Referer': config.url
          },
          body: loginData.toString(),
          redirect: 'follow'
        });

        if (loginResponse.ok) {
          const loginContent = await loginResponse.text();
          console.log(`✅ Connexion directe réussie pour ${module}`);
          return { success: true, method: 'direct-login', html: loginContent };
        } else {
          console.log(`❌ Connexion directe échouée pour ${module}: ${loginResponse.status}`);
        }
      }
    } catch (error) {
      console.log(`❌ Erreur connexion directe pour ${module}:`, error);
    }
  }

  // Méthode 3: Injection de formulaire avec JavaScript ultra-avancé
  if (method === 'form-injection' || method === 'auto') {
    try {
      console.log(`🔐 Tentative injection de formulaire pour ${module}...`);
      
      const response = await fetch(config.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Module-Proxy/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Script d'injection ultra-avancé avec diagnostic complet
        const injectionScript = `
        <script>
          (function() {
            console.log('🔐 [IAHOME] Démarrage injection automatique pour ${module}...');
            console.log('🔐 [IAHOME] Credentials: ${config.credentials.username} / ${config.credentials.password}');
            
            let attempts = 0;
            const maxAttempts = 15;
            let success = false;
            
            // Fonction de logging améliorée
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
              div.innerHTML = '<div style="background:red;padding:5px;margin-bottom:10px;">🔐 IAHOME DEBUG - Form Injection</div>';
              document.body.appendChild(div);
              return div;
            }
            
            function findAndFillForm() {
              if (success) return;
              
              attempts++;
              log(\`Tentative \${attempts}/\${maxAttempts}\`);
              
              // Analyse complète de la page
              log('Analyse de la page en cours...');
              
              // 1. Lister tous les formulaires
              const allForms = document.querySelectorAll('form');
              log(\`Formulaires trouvés: \${allForms.length}\`);
              allForms.forEach((form, index) => {
                log(\`Form \${index + 1}: action="\${form.action}" method="\${form.method}"\`);
              });
              
              // 2. Lister tous les inputs
              const allInputs = document.querySelectorAll('input');
              log(\`Inputs trouvés: \${allInputs.length}\`);
              allInputs.forEach((input, index) => {
                log(\`Input \${index + 1}: type="\${input.type}" name="\${input.name}" id="\${input.id}" placeholder="\${input.placeholder}"\`);
              });
              
              // Recherche exhaustive des champs avec plus de sélecteurs
              const possibleUsernameSelectors = [
                'input[name="username"]',
                'input[name="user"]',
                'input[name="login"]',
                'input[name="email"]',
                'input[name="user_name"]',
                'input[name="login_name"]',
                'input[name="account"]',
                'input[id="username"]',
                'input[id="user"]',
                'input[id="login"]',
                'input[id="email"]',
                'input[type="text"]:not([name*="search"]):not([name*="email"])',
                'input[placeholder*="user" i]',
                'input[placeholder*="login" i]',
                'input[placeholder*="nom" i]',
                'input[placeholder*="account" i]',
                'input[placeholder*="email" i]',
                'input[autocomplete="username"]',
                'input[autocomplete="email"]',
                'input[autocomplete="user"]'
              ];
              
              const possiblePasswordSelectors = [
                'input[name="password"]',
                'input[name="pass"]',
                'input[name="pwd"]',
                'input[name="user_password"]',
                'input[name="login_password"]',
                'input[id="password"]',
                'input[id="pass"]',
                'input[id="pwd"]',
                'input[type="password"]',
                'input[placeholder*="pass" i]',
                'input[placeholder*="mot" i]',
                'input[placeholder*="pwd" i]',
                'input[autocomplete="current-password"]',
                'input[autocomplete="password"]'
              ];
              
              let usernameField = null;
              let passwordField = null;
              
              // Chercher le champ username
              log('Recherche du champ username...');
              for (let selector of possibleUsernameSelectors) {
                usernameField = document.querySelector(selector);
                if (usernameField) {
                  log(\`Champ username trouvé: \${selector}\`);
                  break;
                }
              }
              
              // Chercher le champ password
              log('Recherche du champ password...');
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
                  usernameField.value = '${config.credentials.username}';
                  passwordField.value = '${config.credentials.password}';
                  
                  log('Champs remplis avec succès');
                  
                  // Déclencher tous les événements possibles
                  const events = ['input', 'change', 'blur', 'focus'];
                  events.forEach(eventType => {
                    usernameField.dispatchEvent(new Event(eventType, { bubbles: true }));
                    passwordField.dispatchEvent(new Event(eventType, { bubbles: true }));
                  });
                  
                  log('Événements déclenchés');
                  
                  // Trouver le formulaire
                  const form = usernameField.closest('form') || passwordField.closest('form');
                  if (form) {
                    log(\`📝 Formulaire trouvé: action="\${form.action}" method="\${form.method}"\`);
                    
                    // Méthodes de soumission multiples
                    const submitMethods = [
                      () => {
                        log('Tentative soumission directe...');
                        form.submit();
                      },
                      () => {
                        log('Tentative clic sur bouton submit...');
                        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                        if (submitBtn) submitBtn.click();
                      },
                      () => {
                        log('Tentative clic sur bouton avec texte...');
                        const buttons = form.querySelectorAll('button');
                        for (let btn of buttons) {
                          if (btn.textContent.toLowerCase().includes('login') || 
                              btn.textContent.toLowerCase().includes('connexion') ||
                              btn.textContent.toLowerCase().includes('submit') ||
                              btn.textContent.toLowerCase().includes('envoyer')) {
                            btn.click();
                            break;
                          }
                        }
                      },
                      () => {
                        log('Tentative clic sur premier bouton...');
                        const firstBtn = form.querySelector('button');
                        if (firstBtn) firstBtn.click();
                      }
                    ];
                    
                    // Essayer chaque méthode avec délai
                    submitMethods.forEach((method, index) => {
                      setTimeout(() => {
                        if (!success) {
                          try {
                            method();
                            log(\`Méthode de soumission \${index + 1} exécutée\`);
                          } catch (e) {
                            log(\`Erreur méthode \${index + 1}: \${e.message}\`, 'error');
                          }
                        }
                      }, (index + 1) * 1000);
                    });
                    
                    success = true;
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
              
              // Si on n'a pas trouvé ou si on a encore des tentatives
              if (attempts < maxAttempts && !success) {
                log(\`Nouvelle tentative dans 2s... (tentative \${attempts + 1}/\${maxAttempts})\`);
                setTimeout(findAndFillForm, 2000);
              } else if (!success) {
                log(\`❌ Échec après \${maxAttempts} tentatives\`, 'error');
                log('Page analysée complètement - aucun formulaire de connexion détecté', 'error');
              }
              
              return false;
            }
            
            // Démarrer après chargement
            if (document.readyState === 'loading') {
              log('Page en cours de chargement, attente DOMContentLoaded...');
              document.addEventListener('DOMContentLoaded', findAndFillForm);
            } else {
              log('Page déjà chargée, démarrage immédiat');
              findAndFillForm();
            }
            
            // Tentatives supplémentaires avec délais variables
            setTimeout(findAndFillForm, 3000);
            setTimeout(findAndFillForm, 5000);
            setTimeout(findAndFillForm, 8000);
            setTimeout(findAndFillForm, 12000);
            setTimeout(findAndFillForm, 15000);
            
            // Log final après 20 secondes
            setTimeout(() => {
              log('=== DIAGNOSTIC FINAL ===');
              log(\`Tentatives effectuées: \${attempts}\`);
              log(\`Succès: \${success}\`);
              log('=== FIN DIAGNOSTIC ===');
            }, 20000);
            
          })();
        </script>`;

        const modifiedHtml = html.replace('</head>', injectionScript + '</head>');
        
        return { 
          success: true, 
          method: 'form-injection', 
          html: modifiedHtml 
        };
      }
    } catch (error) {
      console.log(`❌ Erreur injection de formulaire pour ${module}:`, error);
    }
  }

  // Méthode 4: Gestion avancée des cookies de session
  if (method === 'cookie-session' || method === 'auto') {
    try {
      console.log(`🔐 Tentative gestion cookies pour ${module}...`);
      
      // Première requête pour obtenir les cookies
      const initialResponse = await fetch(config.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Module-Proxy/1.0'
        }
      });

      const cookies = initialResponse.headers.get('set-cookie');
      
      if (cookies) {
        // Deuxième requête avec authentification et cookies
        const authResponse = await fetch(config.url, {
          method: 'POST',
          headers: {
            'User-Agent': 'IAHome-Module-Proxy/1.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies,
            'Authorization': `Basic ${credentials}`,
            'Referer': config.url
          },
          body: `username=${encodeURIComponent(config.credentials.username)}&password=${encodeURIComponent(config.credentials.password)}`
        });

        if (authResponse.ok) {
          const authContent = await authResponse.text();
          console.log(`✅ Authentification par cookies réussie pour ${module}`);
          return { success: true, method: 'cookie-session', html: authContent };
        } else {
          console.log(`❌ Auth par cookies échouée pour ${module}: ${authResponse.status}`);
        }
      }
    } catch (error) {
      console.log(`❌ Erreur gestion cookies pour ${module}:`, error);
    }
  }

  // Méthode 5: Authentification Gradio spécifique
  if (method === 'gradio-auth' || method === 'auto') {
    try {
      console.log(`🔐 Tentative authentification Gradio pour ${module}...`);
      
      // Première requête pour obtenir la page et les cookies
      const initialResponse = await fetch(config.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (initialResponse.ok) {
        const html = await initialResponse.text();
        const cookies = initialResponse.headers.get('set-cookie');
        
        // Vérifier si c'est une application Gradio
        if (html.includes('gradio') || html.includes('auth_required')) {
          console.log('✅ Application Gradio détectée');
          
          // Tentative d'authentification via l'API Gradio
          const gradioAuthUrl = `${config.url}/login`;
          
          const authData = new URLSearchParams();
          authData.append('username', config.credentials.username);
          authData.append('password', config.credentials.password);
          
          const authResponse = await fetch(gradioAuthUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Cookie': cookies || '',
              'Referer': config.url,
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: authData.toString(),
            redirect: 'follow'
          });
          
          console.log(`Status authentification Gradio: ${authResponse.status}`);
          
          if (authResponse.ok) {
            const authContent = await authResponse.text();
            
            // Vérifier si la connexion a réussi
            try {
              const authResult = JSON.parse(authContent);
              if (authResult.success) {
                console.log(`✅ Authentification Gradio réussie pour ${module}`);
                
                // Obtenir les cookies de session
                const sessionCookies = authResponse.headers.get('set-cookie');
                
                // Accéder à la page principale avec la session
                const sessionResponse = await fetch(config.url, {
                  method: 'GET',
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Cookie': sessionCookies || cookies || ''
                  }
                });
                
                if (sessionResponse.ok) {
                  const sessionContent = await sessionResponse.text();
                  console.log(`✅ Accès avec session réussi (${sessionContent.length} caractères)`);
                  return { success: true, method: 'gradio-auth', html: sessionContent };
                }
              } else {
                console.log(`❌ Authentification Gradio échouée: ${authContent}`);
              }
            } catch (e) {
              console.log(`❌ Erreur parsing réponse Gradio: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
            }
          } else {
            console.log(`❌ Authentification Gradio échouée: ${authResponse.status}`);
          }
          
          // Si l'authentification directe échoue, essayer avec Basic Auth
          const basicAuthResponse = await fetch(config.url, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Cookie': cookies || ''
            }
          });
          
          if (basicAuthResponse.ok) {
            const basicAuthContent = await basicAuthResponse.text();
            console.log(`✅ Authentification Gradio + Basic Auth réussie pour ${module}`);
            return { success: true, method: 'gradio-basic-auth', html: basicAuthContent };
          }
        }
      }
    } catch (error) {
      console.log(`❌ Erreur authentification Gradio pour ${module}:`, error);
    }
  }

  // Méthode 6: Injection JavaScript avancée pour Gradio
  if (method === 'gradio-injection' || method === 'auto') {
    try {
      console.log(`🔐 Tentative injection JavaScript Gradio pour ${module}...`);
      
      const response = await fetch(config.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Script d'injection spécifique pour Gradio
        const gradioInjectionScript = `
        <script>
          (function() {
            console.log('🔐 [IAHOME] Démarrage injection Gradio pour ${module}...');
            console.log('🔐 [IAHOME] Credentials: ${config.credentials.username} / ${config.credentials.password}');
            
            let attempts = 0;
            const maxAttempts = 20;
            let success = false;
            
            // Fonction de logging améliorée
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
              div.innerHTML = '<div style="background:red;padding:5px;margin-bottom:10px;">🔐 IAHOME DEBUG - Gradio Injection</div>';
              document.body.appendChild(div);
              return div;
            }
            
            function findAndFillGradioForm() {
              if (success) return;
              
              attempts++;
              log(\`Tentative \${attempts}/\${maxAttempts}\`);
              
              // Attendre que Gradio soit chargé
              if (typeof gradio === 'undefined' && typeof window.gradio_config === 'undefined') {
                log('Gradio non encore chargé, attente...');
                if (attempts < maxAttempts) {
                  setTimeout(findAndFillGradioForm, 1000);
                }
                return;
              }
              
              log('Gradio détecté, recherche du formulaire de connexion...');
              
              // Méthode 1: Chercher via l'API Gradio
              if (typeof gradio !== 'undefined') {
                log('Tentative via API Gradio...');
                try {
                  // Chercher les composants Gradio
                  const gradioApp = document.querySelector('gradio-app');
                  if (gradioApp) {
                    log('Composant gradio-app trouvé');
                    
                    // Attendre que l'interface soit chargée
                    const checkGradioReady = () => {
                      const inputs = gradioApp.querySelectorAll('input');
                      const buttons = gradioApp.querySelectorAll('button');
                      
                      log(\`Inputs Gradio: \${inputs.length}, Boutons: \${buttons.length}\`);
                      
                      if (inputs.length > 0) {
                        // Chercher les champs de connexion
                        const usernameField = Array.from(inputs).find(input => 
                          input.type === 'text' && 
                          (input.placeholder?.toLowerCase().includes('user') || 
                           input.name?.toLowerCase().includes('user') ||
                           input.id?.toLowerCase().includes('user'))
                        );
                        
                        const passwordField = Array.from(inputs).find(input => 
                          input.type === 'password'
                        );
                        
                        if (usernameField && passwordField) {
                          log('Champs de connexion Gradio trouvés');
                          
                          // Remplir les champs
                          usernameField.value = '${config.credentials.username}';
                          passwordField.value = '${config.credentials.password}';
                          
                          // Déclencher les événements
                          usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                          passwordField.dispatchEvent(new Event('change', { bubbles: true }));
                          
                          // Chercher le bouton de connexion
                          const loginButton = Array.from(buttons).find(btn => 
                            btn.textContent?.toLowerCase().includes('login') ||
                            btn.textContent?.toLowerCase().includes('connexion') ||
                            btn.textContent?.toLowerCase().includes('sign') ||
                            btn.textContent?.toLowerCase().includes('submit')
                          );
                          
                          if (loginButton) {
                            log('Bouton de connexion trouvé, clic...');
                            loginButton.click();
                            success = true;
                            return;
                          }
                        }
                      }
                      
                      if (attempts < maxAttempts && !success) {
                        setTimeout(checkGradioReady, 1000);
                      }
                    };
                    
                    checkGradioReady();
                    return;
                  }
                } catch (e) {
                  log(\`Erreur API Gradio: \${e.message}\`, 'error');
                }
              }
              
              // Méthode 2: Chercher via les sélecteurs DOM génériques
              log('Recherche via sélecteurs DOM...');
              
              const possibleSelectors = [
                'input[type="text"]',
                'input[type="email"]',
                'input[placeholder*="user" i]',
                'input[placeholder*="login" i]',
                'input[placeholder*="email" i]',
                'input[name*="user" i]',
                'input[id*="user" i]'
              ];
              
              const usernameField = document.querySelector(possibleSelectors.join(', '));
              const passwordField = document.querySelector('input[type="password"]');
              
              if (usernameField && passwordField) {
                log('Champs trouvés via sélecteurs DOM');
                
                usernameField.value = '${config.credentials.username}';
                passwordField.value = '${config.credentials.password}';
                
                usernameField.dispatchEvent(new Event('input', { bubbles: true }));
                passwordField.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Chercher le formulaire parent
                const form = usernameField.closest('form') || passwordField.closest('form');
                if (form) {
                  log('Formulaire trouvé, soumission...');
                  setTimeout(() => form.submit(), 1000);
                  success = true;
                  return;
                }
              }
              
              // Méthode 3: Tentative via fetch vers l'API de connexion
              if (attempts === 5) {
                log('Tentative via API de connexion...');
                fetch('/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: \`username=\${encodeURIComponent('${config.credentials.username}')}&password=\${encodeURIComponent('${config.credentials.password}')}\`
                }).then(response => {
                  log(\`Réponse API: \${response.status}\`);
                  if (response.ok) {
                    log('Connexion via API réussie');
                    success = true;
                    window.location.reload();
                  }
                }).catch(error => {
                  log(\`Erreur API: \${error.message}\`, 'error');
                });
              }
              
              // Continuer les tentatives
              if (attempts < maxAttempts && !success) {
                setTimeout(findAndFillGradioForm, 2000);
              } else if (!success) {
                log('❌ Échec après toutes les tentatives', 'error');
              }
            }
            
            // Démarrer après chargement
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', findAndFillGradioForm);
            } else {
              findAndFillGradioForm();
            }
            
            // Tentatives supplémentaires
            setTimeout(findAndFillGradioForm, 3000);
            setTimeout(findAndFillGradioForm, 6000);
            setTimeout(findAndFillGradioForm, 10000);
            setTimeout(findAndFillGradioForm, 15000);
            
          })();
        </script>`;

        const modifiedHtml = html.replace('</head>', gradioInjectionScript + '</head>');
        
        return { 
          success: true, 
          method: 'gradio-injection', 
          html: modifiedHtml 
        };
      }
    } catch (error) {
      console.log(`❌ Erreur injection Gradio pour ${module}:`, error);
    }
  }

  // Si aucune méthode n'a fonctionné, retourner une page d'erreur avec diagnostic
  console.log(`❌ Aucune méthode d'authentification n'a fonctionné pour ${module}`);
  
  const diagnosticHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Diagnostic - ${module}</title>
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
        <h1>🔐 Diagnostic d'Authentification - ${module}</h1>
        
        <div class="error">
          <h2>❌ Échec de l'authentification automatique</h2>
          <p>Aucune méthode d'authentification n'a fonctionné pour accéder à <strong>${config.url}</strong></p>
        </div>
        
        <div class="info">
          <h3>📋 Informations de diagnostic :</h3>
          <ul>
            <li><strong>Module :</strong> ${module}</li>
            <li><strong>URL :</strong> ${config.url}</li>
            <li><strong>Username :</strong> ${config.credentials.username}</li>
            <li><strong>Méthodes testées :</strong> ${config.authMethods.join(', ')}</li>
            <li><strong>Statut initial :</strong> ${initialTest.status}</li>
          </ul>
        </div>
        
        <div class="success">
          <h3>🛠️ Solutions possibles :</h3>
          <ol>
            <li>Vérifiez que l'URL ${config.url} est accessible</li>
            <li>Vérifiez les credentials (username/password)</li>
            <li>Essayez d'accéder manuellement à l'application</li>
            <li>Vérifiez la configuration du module</li>
          </ol>
        </div>
        
        <div>
          <h3>🧪 Tests rapides :</h3>
          <button class="test-btn" onclick="testDirectAccess()">Test Accès Direct</button>
          <button class="test-btn" onclick="testBasicAuth()">Test Basic Auth</button>
          <button class="test-btn" onclick="window.open('${config.url}', '_blank')">Ouvrir dans un nouvel onglet</button>
        </div>
        
        <div id="test-results"></div>
      </div>
      
      <script>
        async function testDirectAccess() {
          const results = document.getElementById('test-results');
          results.innerHTML = '<p>Test en cours...</p>';
          
          try {
            const response = await fetch('${config.url}');
            results.innerHTML = '<p class="success">✅ Accès direct : ' + response.status + '</p>';
          } catch (error) {
            results.innerHTML = '<p class="error">❌ Erreur accès direct : ' + error.message + '</p>';
          }
        }
        
        async function testBasicAuth() {
          const results = document.getElementById('test-results');
          results.innerHTML = '<p>Test Basic Auth en cours...</p>';
          
          try {
            const response = await fetch('${config.url}', {
              headers: {
                'Authorization': 'Basic ${credentials}'
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
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');

    console.log('🔐 Accès module GET demandé:', module);

    if (!module || !MODULES_CONFIG[module]) {
      return NextResponse.json(
        { error: `Module ${module} non configuré` },
        { status: 400 }
      );
    }

    const config = MODULES_CONFIG[module];

    // Proxy avec authentification
    const credentials = Buffer.from(`${config.credentials.username}:${config.credentials.password}`).toString('base64');
    
    const headers = new Headers();
    headers.set('Authorization', `Basic ${credentials}`);
    headers.set('User-Agent', 'IAHome-Module-Proxy/1.0');

    const response = await fetch(config.url, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Réponse module:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Erreur module:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erreur ${module}: ${response.status}` },
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
        // Injection automatique des credentials pour ${module}
        window.addEventListener('load', function() {
          setTimeout(function() {
            // Chercher les champs de formulaire
            const usernameInputs = document.querySelectorAll('input[name="username"], input[name="user"], input[type="text"]');
            const passwordInputs = document.querySelectorAll('input[name="password"], input[name="pass"], input[type="password"]');
            
            if (usernameInputs.length > 0 && passwordInputs.length > 0) {
              // Remplir les champs
              usernameInputs[0].value = '${config.credentials.username}';
              passwordInputs[0].value = '${config.credentials.password}';
              
              // Trouver et soumettre le formulaire
              const form = usernameInputs[0].closest('form') || passwordInputs[0].closest('form');
              if (form) {
                console.log('🔐 Authentification automatique pour ${module}...');
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

    console.log('✅ HTML modifié avec authentification automatique pour', module);

    // Retourner le HTML modifié
    return new NextResponse(modifiedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Module-Proxy',
        'X-Module': module,
      },
    });

  } catch (error) {
    console.error('❌ Erreur accès module GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module, action = 'proxy' } = body;

    console.log('🔐 Accès module POST demandé:', { module, action });

    if (!MODULES_CONFIG[module]) {
      return NextResponse.json(
        { error: `Module ${module} non configuré` },
        { status: 400 }
      );
    }

    const config = MODULES_CONFIG[module];

    if (action === 'redirect') {
      // Redirection directe avec credentials dans l'URL
      const credentials = Buffer.from(`${config.credentials.username}:${config.credentials.password}`).toString('base64');
      const authUrl = `${config.url.replace('https://', `https://${credentials}@`)}`;
      
      console.log('🔗 Redirection vers:', authUrl);
      return NextResponse.json({ 
        success: true, 
        redirectUrl: authUrl,
        module: module 
      });
    }

    // Proxy avec authentification
    const credentials = Buffer.from(`${config.credentials.username}:${config.credentials.password}`).toString('base64');
    
    const headers = new Headers();
    headers.set('Authorization', `Basic ${credentials}`);
    headers.set('User-Agent', 'IAHome-Module-Proxy/1.0');

    const response = await fetch(config.url, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Réponse module:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Erreur module:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Erreur ${module}: ${response.status}` },
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
        // Injection automatique des credentials pour ${module}
        window.addEventListener('load', function() {
          setTimeout(function() {
            // Chercher les champs de formulaire
            const usernameInputs = document.querySelectorAll('input[name="username"], input[name="user"], input[type="text"]');
            const passwordInputs = document.querySelectorAll('input[name="password"], input[name="pass"], input[type="password"]');
            
            if (usernameInputs.length > 0 && passwordInputs.length > 0) {
              // Remplir les champs
              usernameInputs[0].value = '${config.credentials.username}';
              passwordInputs[0].value = '${config.credentials.password}';
              
              // Trouver et soumettre le formulaire
              const form = usernameInputs[0].closest('form') || passwordInputs[0].closest('form');
              if (form) {
                console.log('🔐 Authentification automatique pour ${module}...');
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

    console.log('✅ HTML modifié avec authentification automatique pour', module);

    // Retourner le HTML modifié
    return new NextResponse(modifiedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Module-Proxy',
        'X-Module': module,
      },
    });

  } catch (error) {
    console.error('❌ Erreur accès module POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { module, method = 'auto', action = 'bypass' } = body;

    console.log('🔐 Accès module PUT demandé:', { module, method, action });

    if (!MODULES_CONFIG[module]) {
      return NextResponse.json(
        { error: `Module ${module} non configuré` },
        { status: 400 }
      );
    }

    if (action === 'bypass') {
      const result = await bypassAuthentication(module, method);
      
      if (result.success) {
        // Retourner le HTML modifié
        return new NextResponse(result.html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
            'X-Proxy-By': 'IAHome-Module-Proxy',
            'X-Module': module,
            'X-Auth-Method': result.method
          },
        });
      } else {
        // Retourner la page de diagnostic
        return new NextResponse(result.html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
            'X-Proxy-By': 'IAHome-Module-Proxy',
            'X-Module': module,
            'X-Auth-Method': result.method
          },
        });
      }
    }

    return NextResponse.json(
      { error: 'Action non supportée' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erreur accès module PUT:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 