const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';
const CREDENTIALS = {
  username: 'admin',
  password: 'Rasulova75'
};

async function analyzeGradioResponse() {
  console.log('🔍 Analyse de la réponse de connexion Gradio...\n');
  
  try {
    // 1. Obtenir les cookies initiaux
    console.log('📡 Obtention des cookies initiaux...');
    const initialResponse = await fetch(STABLEDIFFUSION_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const cookies = initialResponse.headers.get('set-cookie');
    console.log(`Cookies initiaux: ${cookies || 'Aucun'}`);
    
    // 2. Tentative de connexion
    console.log('\n🔐 Tentative de connexion...');
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
    
    console.log(`Status: ${authResponse.status}`);
    console.log(`Content-Type: ${authResponse.headers.get('content-type')}`);
    
    const authContent = await authResponse.text();
    console.log(`Contenu brut: "${authContent}"`);
    console.log(`Longueur: ${authContent.length} caractères`);
    
    // 3. Analyser la réponse JSON
    if (authResponse.headers.get('content-type')?.includes('application/json')) {
      try {
        const jsonResponse = JSON.parse(authContent);
        console.log('\n📋 Réponse JSON analysée:');
        console.log(JSON.stringify(jsonResponse, null, 2));
        
        // Vérifier si la connexion a réussi
        if (jsonResponse.success || jsonResponse.authenticated || jsonResponse.status === 'success') {
          console.log('✅ Connexion réussie selon la réponse JSON');
        } else {
          console.log('❌ Connexion échouée selon la réponse JSON');
        }
      } catch (e) {
        console.log('❌ Erreur parsing JSON:', e.message);
      }
    }
    
    // 4. Vérifier les nouveaux cookies
    const newCookies = authResponse.headers.get('set-cookie');
    console.log(`\n🍪 Nouveaux cookies: ${newCookies || 'Aucun'}`);
    
    // 5. Tester l'accès à la page principale avec les cookies de session
    console.log('\n🌐 Test d\'accès avec session...');
    
    const sessionResponse = await fetch(STABLEDIFFUSION_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': newCookies || cookies || ''
      }
    });
    
    console.log(`Status session: ${sessionResponse.status}`);
    
    if (sessionResponse.ok) {
      const sessionContent = await sessionResponse.text();
      console.log(`Contenu avec session: ${sessionContent.length} caractères`);
      
      // Vérifier si on est connecté
      if (sessionContent.includes('logout') || sessionContent.includes('déconnexion') || 
          sessionContent.includes('welcome') || sessionContent.includes('bienvenue') ||
          !sessionContent.includes('login') || !sessionContent.includes('auth_required')) {
        console.log('✅ Session active - utilisateur connecté');
      } else {
        console.log('❌ Session inactive - utilisateur non connecté');
      }
      
      // Sauvegarder le contenu
      const fs = require('fs');
      fs.writeFileSync('stablediffusion-session.html', sessionContent);
      console.log('✅ Contenu avec session sauvegardé dans stablediffusion-session.html');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécution
analyzeGradioResponse().then(() => {
  console.log('\n✅ Analyse terminée');
}); 