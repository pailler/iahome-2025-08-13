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
      // Ignorer les erreurs de certificat SSL
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

async function testStableDiffusion() {
  console.log('🔍 Test d\'accès à StableDiffusion...');
  
  try {
    const result = await makeRequest('https://stablediffusion.regispailler.fr');
    
    console.log('✅ Accès réussi!');
    console.log(`Status: ${result.status}`);
    console.log(`Content-Type: ${result.headers['content-type']}`);
    console.log(`Content-Length: ${result.headers['content-length']}`);
    
    // Vérifier si c'est une page Gradio
    if (result.data.includes('gradio')) {
      console.log('🎯 Page Gradio détectée!');
    }
    
    // Vérifier si l'authentification est requise
    if (result.data.includes('auth_required') || result.data.includes('login')) {
      console.log('🔐 Authentification requise détectée');
    } else {
      console.log('✅ Pas d\'authentification requise');
    }
    
    // Afficher les premiers 500 caractères
    console.log('\n📄 Contenu (premiers 500 caractères):');
    console.log(result.data.substring(0, 500));
    
  } catch (error) {
    console.log('❌ Erreur d\'accès:', error.message);
  }
}

async function testLaunchArgs() {
  console.log('\n🔍 Test de récupération des Launch Args...');
  
  try {
    const result = await makeRequest('https://stablediffusion.regispailler.fr/config');
    
    console.log('✅ Config API accessible!');
    console.log(`Status: ${result.status}`);
    
    if (result.data) {
      try {
        const config = JSON.parse(result.data);
        console.log('📋 Configuration Gradio:');
        console.log(JSON.stringify(config, null, 2));
      } catch (e) {
        console.log('⚠️ Config n\'est pas du JSON valide');
        console.log(result.data.substring(0, 200));
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur accès config:', error.message);
  }
}

async function main() {
  console.log('🚀 Test Simple - StableDiffusion Access\n');
  
  await testStableDiffusion();
  await testLaunchArgs();
  
  console.log('\n✅ Tests terminés');
}

main().catch(console.error); 