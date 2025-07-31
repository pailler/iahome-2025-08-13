const fetch = require('node-fetch');

// Configuration de test
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  modules: ['stablediffusion', 'iatube', 'iametube'],
  methods: ['auto', 'basic-auth', 'direct-login', 'form-injection', 'cookie-session']
};

// Test de connectivité réseau
async function testNetworkConnectivity() {
  console.log('🌐 Test de connectivité réseau...');
  
  const testUrls = [
    'https://stablediffusion.regispailler.fr',
    'https://iatube.regispailler.fr', 
    'https://iametube.regispailler.fr'
  ];
  
  for (const url of testUrls) {
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Test/1.0'
        },
        timeout: 10000
      });
      const endTime = Date.now();
      
      console.log(`  ${url}: ${response.status} (${endTime - startTime}ms)`);
      
      if (response.ok) {
        console.log(`    ✅ Accessible`);
      } else {
        console.log(`    ⚠️  Erreur ${response.status}`);
      }
    } catch (error) {
      console.log(`  ${url}: ❌ ${error.message}`);
    }
  }
}

// Test d'authentification Basic HTTP directe
async function testDirectBasicAuth(module) {
  console.log(`\n🔐 Test Basic Auth directe pour ${module}...`);
  
  const moduleUrls = {
    stablediffusion: 'https://stablediffusion.regispailler.fr',
    iatube: 'https://iatube.regispailler.fr',
    iametube: 'https://iametube.regispailler.fr'
  };
  
  const url = moduleUrls[module];
  const credentials = Buffer.from('admin:Rasulova75').toString('base64');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'IAHome-Test/1.0'
      },
      redirect: 'follow'
    });
    
    console.log(`  Statut: ${response.status} ${response.statusText}`);
    console.log(`  Content-Type: ${response.headers.get('content-type')}`);
    console.log(`  Content-Length: ${response.headers.get('content-length')}`);
    
    if (response.ok) {
      const content = await response.text();
      console.log(`  ✅ Succès! Contenu reçu (${content.length} caractères)`);
      
      // Analyser le contenu
      if (content.includes('login') || content.includes('username') || content.includes('password')) {
        console.log(`  ⚠️  Page de connexion détectée`);
      } else if (content.includes('dashboard') || content.includes('welcome') || content.includes('home')) {
        console.log(`  🎉 Page authentifiée détectée!`);
      } else {
        console.log(`  ℹ️  Contenu neutre`);
      }
    } else {
      console.log(`  ❌ Échec de l'authentification`);
    }
  } catch (error) {
    console.log(`  ❌ Erreur: ${error.message}`);
  }
}

// Test de l'API module-access
async function testModuleAccessAPI(module, method) {
  console.log(`\n🔐 Test API module-access pour ${module} avec méthode ${method}...`);
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/module-access`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        module,
        method,
        action: 'bypass'
      }),
    });

    console.log(`  Statut API: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    const authMethod = response.headers.get('x-auth-method');
    
    console.log(`  Content-Type: ${contentType}`);
    console.log(`  Méthode d'auth utilisée: ${authMethod || 'Non spécifiée'}`);

    if (response.ok) {
      if (contentType && contentType.includes('text/html')) {
        const html = await response.text();
        console.log(`  ✅ HTML reçu (${html.length} caractères)`);
        
        // Analyser le contenu HTML
        if (html.includes('Diagnostic d\'Authentification')) {
          console.log(`  ⚠️  Page de diagnostic - échec de l'authentification`);
        } else if (html.includes('login') || html.includes('username') || html.includes('password')) {
          console.log(`  ⚠️  Page de connexion détectée`);
        } else {
          console.log(`  🎉 Contenu authentifié possible`);
        }
      } else {
        const data = await response.json();
        console.log(`  ✅ Données JSON reçues:`, data);
      }
    } else {
      const errorData = await response.json();
      console.log(`  ❌ Erreur API: ${errorData.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    console.log(`  ❌ Erreur de connexion: ${error.message}`);
  }
}

// Test de diagnostic complet
async function runDiagnostic(module) {
  console.log(`\n🔍 Diagnostic complet pour ${module}`);
  console.log('='.repeat(60));
  
  // Test 1: Connectivité réseau
  await testNetworkConnectivity();
  
  // Test 2: Basic Auth directe
  await testDirectBasicAuth(module);
  
  // Test 3: API avec différentes méthodes
  for (const method of ['auto', 'basic-auth', 'direct-login', 'form-injection']) {
    await testModuleAccessAPI(module, method);
  }
  
  console.log('\n' + '='.repeat(60));
}

// Test de tous les modules
async function testAllModules() {
  console.log('🚀 Test complet de tous les modules...\n');
  
  for (const module of TEST_CONFIG.modules) {
    await runDiagnostic(module);
  }
  
  console.log('\n✅ Tests terminés!');
}

// Test spécifique pour Stable Diffusion
async function testStableDiffusion() {
  console.log('🎨 Test spécifique pour Stable Diffusion...\n');
  await runDiagnostic('stablediffusion');
}

// Test de l'API locale
async function testLocalAPI() {
  console.log('🏠 Test de l\'API locale...\n');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/module-access?module=stablediffusion`, {
      method: 'GET'
    });
    
    console.log(`Statut: ${response.status}`);
    
    if (response.ok) {
      const html = await response.text();
      console.log(`✅ API locale fonctionne (${html.length} caractères)`);
    } else {
      console.log(`❌ API locale en erreur: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Erreur API locale: ${error.message}`);
  }
}

// Exécution des tests
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--stable-diffusion')) {
    testStableDiffusion();
  } else if (args.includes('--local-api')) {
    testLocalAPI();
  } else if (args.includes('--network')) {
    testNetworkConnectivity();
  } else if (args.includes('--module') && args[args.indexOf('--module') + 1]) {
    const module = args[args.indexOf('--module') + 1];
    runDiagnostic(module);
  } else {
    testAllModules();
  }
}

module.exports = {
  testNetworkConnectivity,
  testDirectBasicAuth,
  testModuleAccessAPI,
  runDiagnostic,
  testAllModules
}; 