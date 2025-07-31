const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

console.log('🔍 Test de la méthode Launch Args pour StableDiffusion');
console.log('==================================================');

const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';

async function testLaunchArgs() {
  try {
    console.log('📡 1. Test d\'accès à la page principale...');
    
    const mainResponse = await fetch(STABLEDIFFUSION_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Module-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (mainResponse.ok) {
      const html = await mainResponse.text();
      console.log(`✅ Page principale accessible (${html.length} caractères)`);
      
      // Chercher les arguments de lancement dans le HTML
      console.log('🔍 2. Recherche des arguments de lancement...');
      
      const launchArgsPatterns = [
        /--gradio-auth\s+([^\s]+)/g,
        /--gradio-auth-path\s+([^\s]+)/g,
        /--auth\s+([^\s]+)/g,
        /gradio_auth\s*=\s*["']([^"']+)["']/g,
        /auth_required\s*:\s*true/g,
        /window\.gradio_config\s*=\s*({[^}]+})/g
      ];

      let foundArgs = [];
      
      launchArgsPatterns.forEach((pattern, index) => {
        const matches = html.match(pattern);
        if (matches) {
          console.log(`✅ Pattern ${index + 1} trouvé:`, matches);
          foundArgs.push(...matches);
        }
      });

      if (foundArgs.length > 0) {
        console.log(`✅ ${foundArgs.length} arguments de lancement trouvés`);
        foundArgs.forEach((arg, index) => {
          console.log(`   ${index + 1}. ${arg}`);
        });
      } else {
        console.log('❌ Aucun argument de lancement trouvé dans le HTML');
      }

      // Chercher la configuration Gradio
      console.log('🔍 3. Recherche de la configuration Gradio...');
      
      const gradioConfigMatch = html.match(/window\.gradio_config\s*=\s*({[\s\S]*?});/);
      if (gradioConfigMatch) {
        console.log('✅ Configuration Gradio trouvée');
        try {
          const configStr = gradioConfigMatch[1];
          const config = JSON.parse(configStr);
          console.log('📋 Config Gradio:', JSON.stringify(config, null, 2));
          
          if (config.auth_required) {
            console.log('🔐 Authentification requise détectée');
          }
        } catch (e) {
          console.log('❌ Erreur parsing config Gradio:', e.message);
        }
      } else {
        console.log('❌ Configuration Gradio non trouvée');
      }

    } else {
      console.log(`❌ Erreur accès page principale: ${mainResponse.status}`);
    }

    console.log('\n📡 4. Test de l\'API de configuration...');
    
    const configResponse = await fetch(`${STABLEDIFFUSION_URL}/config`, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Module-Proxy/1.0',
        'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (configResponse.ok) {
      try {
        const configData = await configResponse.json();
        console.log('✅ API config accessible');
        console.log('📋 Données config:', JSON.stringify(configData, null, 2));
        
        if (configData.auth) {
          console.log('🔐 Configuration d\'auth trouvée:', configData.auth);
        }
      } catch (e) {
        console.log('❌ Erreur parsing API config:', e.message);
        const text = await configResponse.text();
        console.log('📄 Contenu brut:', text.substring(0, 500));
      }
    } else {
      console.log(`❌ API config non accessible: ${configResponse.status}`);
    }

    console.log('\n📡 5. Test avec credentials par défaut...');
    
    const credentials = Buffer.from('admin:Rasulova75').toString('base64');
    const authResponse = await fetch(STABLEDIFFUSION_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'IAHome-Module-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (authResponse.ok) {
      console.log('✅ Authentification avec credentials par défaut réussie');
      const authContent = await authResponse.text();
      console.log(`📄 Contenu authentifié (${authContent.length} caractères)`);
      
      // Vérifier si on a accès au contenu principal
      if (authContent.includes('Stable Diffusion') || authContent.includes('gradio')) {
        console.log('✅ Contenu principal accessible après authentification');
      } else {
        console.log('⚠️ Contenu principal non détecté après authentification');
      }
    } else {
      console.log(`❌ Authentification échouée: ${authResponse.status}`);
    }

  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testLaunchArgs().then(() => {
  console.log('\n🏁 Test Launch Args terminé');
}).catch(error => {
  console.log('❌ Erreur fatale:', error);
}); 