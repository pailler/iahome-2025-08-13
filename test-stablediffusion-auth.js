const https = require('https');
const http = require('http');

// Fonction pour ignorer les erreurs de certificat SSL
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'IAHome-Test/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers
      },
      rejectUnauthorized: false
    };

    const client = isHttps ? https : http;
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function testMainPage() {
  console.log('🔍 Test de la page principale...');
  
  try {
    const result = await makeRequest('https://stablediffusion.regispailler.fr');
    
    console.log(`✅ Status: ${result.status}`);
    
    // Chercher les informations d'authentification dans le HTML
    if (result.data.includes('auth_required')) {
      console.log('🔐 Authentification requise détectée dans le HTML');
    }
    
    if (result.data.includes('gradio_config')) {
      console.log('🎯 Configuration Gradio trouvée dans le HTML');
      
      // Extraire la configuration Gradio
      const gradioMatch = result.data.match(/window\.gradio_config\s*=\s*({.*?});/s);
      if (gradioMatch) {
        try {
          const config = JSON.parse(gradioMatch[1]);
          console.log('📋 Configuration Gradio extraite:');
          console.log(JSON.stringify(config, null, 2));
        } catch (e) {
          console.log('⚠️ Impossible de parser la config Gradio');
        }
      }
    }
    
    // Chercher les arguments de lancement
    const launchArgsMatch = result.data.match(/--gradio-auth\s+([^\s]+)/);
    if (launchArgsMatch) {
      console.log(`🔑 Argument de lancement trouvé: ${launchArgsMatch[1]}`);
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

async function testConfigAPI() {
  console.log('\n🔍 Test de l\'API /config...');
  
  try {
    const result = await makeRequest('https://stablediffusion.regispailler.fr/config');
    
    console.log(`Status: ${result.status}`);
    
    if (result.status === 401) {
      console.log('🔐 Authentification requise pour l\'API config');
    } else if (result.status === 200) {
      console.log('✅ API config accessible sans authentification');
      try {
        const config = JSON.parse(result.data);
        console.log('📋 Configuration API:');
        console.log(JSON.stringify(config, null, 2));
      } catch (e) {
        console.log('⚠️ Réponse non-JSON:', result.data.substring(0, 200));
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

async function testGradioAuth() {
  console.log('\n🔍 Test de l\'authentification Gradio...');
  
  try {
    // Essayer l'authentification avec les credentials par défaut
    const authData = {
      username: 'admin',
      password: 'Rasulova75'
    };
    
    const result = await makeRequest('https://stablediffusion.regispailler.fr/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${result.status}`);
    console.log('Réponse:', result.data.substring(0, 200));
    
  } catch (error) {
    console.log('❌ Erreur auth:', error.message);
  }
}

async function testWithCredentials() {
  console.log('\n🔍 Test avec authentification Basic...');
  
  try {
    const credentials = Buffer.from('admin:Rasulova75').toString('base64');
    
    const result = await makeRequest('https://stablediffusion.regispailler.fr/config', {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });
    
    console.log(`Status: ${result.status}`);
    
    if (result.status === 200) {
      console.log('✅ Authentification Basic réussie!');
      try {
        const config = JSON.parse(result.data);
        console.log('📋 Configuration avec auth:');
        console.log(JSON.stringify(config, null, 2));
      } catch (e) {
        console.log('⚠️ Réponse non-JSON:', result.data.substring(0, 200));
      }
    } else {
      console.log('❌ Authentification Basic échouée');
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

async function main() {
  console.log('🚀 Test Authentification StableDiffusion\n');
  
  await testMainPage();
  await testConfigAPI();
  await testGradioAuth();
  await testWithCredentials();
  
  console.log('\n✅ Tests terminés');
}

main().catch(console.error); 