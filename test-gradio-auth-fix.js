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

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testGradioLogin() {
  console.log('🔍 Test authentification Gradio avec le bon format...');
  
  try {
    // Format correct pour l'API Gradio
    const authData = JSON.stringify({
      username: 'admin',
      password: 'Rasulova75'
    });
    
    const result = await makeRequest('https://stablediffusion.regispailler.fr/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(authData)
      },
      body: authData
    });
    
    console.log(`Status: ${result.status}`);
    console.log('Headers:', result.headers);
    console.log('Réponse:', result.data);
    
    if (result.status === 200) {
      console.log('✅ Authentification réussie!');
      
      // Tester l'accès à /config avec les cookies de session
      const cookies = result.headers['set-cookie'];
      if (cookies) {
        console.log('🍪 Cookies de session:', cookies);
        
        const configResult = await makeRequest('https://stablediffusion.regispailler.fr/config', {
          headers: {
            'Cookie': cookies.join('; ')
          }
        });
        
        console.log(`\n🔍 Test /config avec cookies - Status: ${configResult.status}`);
        if (configResult.status === 200) {
          console.log('✅ Accès à /config réussi avec authentification!');
          console.log('Configuration:', configResult.data.substring(0, 500));
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

async function testAlternativeAuth() {
  console.log('\n🔍 Test authentification alternative...');
  
  try {
    // Essayer avec le format form-data
    const formData = 'username=admin&password=Rasulova75';
    
    const result = await makeRequest('https://stablediffusion.regispailler.fr/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData)
      },
      body: formData
    });
    
    console.log(`Status: ${result.status}`);
    console.log('Réponse:', result.data.substring(0, 200));
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

async function testDirectAccess() {
  console.log('\n🔍 Test accès direct avec credentials dans l\'URL...');
  
  try {
    const result = await makeRequest('https://admin:Rasulova75@stablediffusion.regispailler.fr/config');
    
    console.log(`Status: ${result.status}`);
    if (result.status === 200) {
      console.log('✅ Accès direct réussi!');
      console.log('Configuration:', result.data.substring(0, 500));
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

async function main() {
  console.log('🚀 Test Authentification Gradio - StableDiffusion\n');
  
  await testGradioLogin();
  await testAlternativeAuth();
  await testDirectAccess();
  
  console.log('\n✅ Tests terminés');
}

main().catch(console.error); 