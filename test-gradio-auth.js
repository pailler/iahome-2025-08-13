const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';
const CREDENTIALS = {
  username: 'admin',
  password: 'Rasulova75'
};

async function testGradioAuth() {
  console.log('🔐 Test d\'authentification Gradio pour StableDiffusion...\n');
  
  try {
    // 1. Test d'accès initial
    console.log('📡 Test d\'accès initial...');
    const initialResponse = await fetch(STABLEDIFFUSION_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`Status initial: ${initialResponse.status}`);
    const cookies = initialResponse.headers.get('set-cookie');
    console.log(`Cookies: ${cookies ? 'Présents' : 'Aucun'}`);
    
    if (!initialResponse.ok) {
      console.log('❌ Page non accessible');
      return;
    }
    
    const html = await initialResponse.text();
    console.log(`✅ Page récupérée (${html.length} caractères)`);
    
    // 2. Vérifier si c'est une application Gradio
    if (html.includes('gradio') || html.includes('auth_required')) {
      console.log('✅ Application Gradio détectée');
    } else {
      console.log('❌ Application Gradio non détectée');
      return;
    }
    
    // 3. Test de l'API de connexion Gradio
    console.log('\n🔐 Test de l\'API de connexion Gradio...');
    const gradioAuthUrl = `${STABLEDIFFUSION_URL}/login`;
    
    const authData = new URLSearchParams();
    authData.append('username', CREDENTIALS.username);
    authData.append('password', CREDENTIALS.password);
    
    const authResponse = await fetch(gradioAuthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': cookies || '',
        'Referer': STABLEDIFFUSION_URL,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: authData.toString(),
      redirect: 'follow'
    });
    
    console.log(`Status authentification: ${authResponse.status}`);
    console.log(`Headers de réponse:`, Object.fromEntries(authResponse.headers.entries()));
    
    if (authResponse.ok) {
      const authContent = await authResponse.text();
      console.log(`✅ Authentification réussie! (${authContent.length} caractères)`);
      
      // Vérifier si on est redirigé
      const finalUrl = authResponse.url;
      if (finalUrl !== STABLEDIFFUSION_URL) {
        console.log(`Redirection vers: ${finalUrl}`);
      }
      
      // Analyser le contenu de la page connectée
      if (authContent.includes('logout') || authContent.includes('déconnexion') || 
          authContent.includes('welcome') || authContent.includes('bienvenue')) {
        console.log('✅ Indicateurs de connexion réussie trouvés');
      }
      
    } else {
      console.log('❌ Authentification échouée');
      
      // 4. Test avec Basic Auth
      console.log('\n🔑 Test avec Basic Auth...');
      const credentials = Buffer.from(`${CREDENTIALS.username}:${CREDENTIALS.password}`).toString('base64');
      
      const basicAuthResponse = await fetch(STABLEDIFFUSION_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Cookie': cookies || ''
        }
      });
      
      console.log(`Status Basic Auth: ${basicAuthResponse.status}`);
      
      if (basicAuthResponse.ok) {
        const basicAuthContent = await basicAuthResponse.text();
        console.log(`✅ Basic Auth réussi! (${basicAuthContent.length} caractères)`);
      } else {
        console.log('❌ Basic Auth échoué');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

async function testGradioAPI() {
  console.log('\n🔐 Test de l\'API de bypass avec méthode Gradio...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/module-access', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        module: 'stablediffusion',
        method: 'gradio-auth'
      })
    });
    
    console.log(`Status API: ${response.status}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log(`✅ Réponse API: ${result.length} caractères`);
      
      // Sauvegarder la réponse
      const fs = require('fs');
      fs.writeFileSync('gradio-auth-response.html', result);
      console.log('✅ Réponse sauvegardée dans gradio-auth-response.html');
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Erreur API: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur API:', error.message);
  }
}

async function testGradioInjection() {
  console.log('\n🎯 Test de l\'injection JavaScript Gradio...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/module-access', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        module: 'stablediffusion',
        method: 'gradio-injection'
      })
    });
    
    console.log(`Status API: ${response.status}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log(`✅ Réponse API: ${result.length} caractères`);
      
      // Sauvegarder la réponse
      const fs = require('fs');
      fs.writeFileSync('gradio-injection-response.html', result);
      console.log('✅ Réponse sauvegardée dans gradio-injection-response.html');
      
      // Vérifier si le script d'injection est présent
      if (result.includes('gradio-injection') && result.includes('IAHOME')) {
        console.log('✅ Script d\'injection Gradio détecté dans la réponse');
      }
      
    } else {
      const errorText = await response.text();
      console.log(`❌ Erreur API: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur API:', error.message);
  }
}

// Exécution
async function main() {
  console.log('🚀 Démarrage des tests Gradio...\n');
  
  await testGradioAuth();
  await testGradioAPI();
  await testGradioInjection();
  
  console.log('\n✅ Tests terminés');
}

main(); 