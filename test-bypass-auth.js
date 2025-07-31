const fetch = require('node-fetch');

// Configuration de test
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  modules: ['stablediffusion', 'iatube', 'iametube'],
  methods: ['auto', 'basic-auth', 'form-injection', 'cookie-session']
};

async function testBypassAuth(module, method) {
  console.log(`\n🔐 Test d'outrepassement pour ${module} avec méthode ${method}...`);
  
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

    console.log(`📡 Statut de réponse: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    const authMethod = response.headers.get('x-auth-method');
    
    console.log(`📋 Content-Type: ${contentType}`);
    console.log(`🔑 Méthode d'auth utilisée: ${authMethod || 'Non spécifiée'}`);

    if (response.ok) {
      if (contentType && contentType.includes('text/html')) {
        const html = await response.text();
        console.log(`✅ Succès! HTML reçu (${html.length} caractères)`);
        
        // Vérifier si le HTML contient des éléments d'authentification
        if (html.includes('login') || html.includes('username') || html.includes('password')) {
          console.log(`⚠️  Page de connexion détectée - injection JavaScript nécessaire`);
        } else {
          console.log(`🎉 Page authentifiée détectée - accès direct réussi!`);
        }
      } else {
        const data = await response.json();
        console.log(`✅ Succès! Données JSON reçues:`, data);
      }
    } else {
      const errorData = await response.json();
      console.log(`❌ Erreur: ${errorData.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
  }
}

async function testDirectAccess(module) {
  console.log(`\n🌐 Test d'accès direct pour ${module}...`);
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/module-access?module=${module}`, {
      method: 'GET',
    });

    console.log(`📡 Statut de réponse: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const html = await response.text();
      console.log(`✅ Accès direct réussi! HTML reçu (${html.length} caractères)`);
    } else {
      const errorData = await response.json();
      console.log(`❌ Erreur: ${errorData.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests d\'outrepassement d\'identification...\n');
  
  // Test 1: Accès direct avec GET
  console.log('='.repeat(60));
  console.log('TEST 1: Accès direct avec méthode GET');
  console.log('='.repeat(60));
  
  for (const module of TEST_CONFIG.modules) {
    await testDirectAccess(module);
  }
  
  // Test 2: Outrepassement avec PUT
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Outrepassement d\'identification avec méthode PUT');
  console.log('='.repeat(60));
  
  for (const module of TEST_CONFIG.modules) {
    for (const method of TEST_CONFIG.methods) {
      await testBypassAuth(module, method);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests terminés!');
  console.log('='.repeat(60));
}

// Test spécifique pour Stable Diffusion
async function testStableDiffusionSpecific() {
  console.log('\n🎨 Test spécifique pour Stable Diffusion...');
  
  const methods = ['auto', 'form-injection'];
  
  for (const method of methods) {
    await testBypassAuth('stablediffusion', method);
  }
}

// Exécution des tests
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--stable-diffusion')) {
    testStableDiffusionSpecific();
  } else {
    runAllTests();
  }
}

module.exports = {
  testBypassAuth,
  testDirectAccess,
  runAllTests
}; 