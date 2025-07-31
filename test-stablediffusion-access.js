const fetch = require('node-fetch');

console.log('🧪 Test d\'accès à Stable Diffusion via magic link...\n');

async function testStableDiffusionAccess() {
  try {
    // Token du magic link créé
    const token = '46e2c757429488251079882de116364f418a9ed0e318027720ae524569db63f4';
    
    // URL d'accès via le proxy
    const accessUrl = `http://localhost:8021/api/proxy-access?token=${token}&module=stablediffusion`;
    
    console.log('🔗 URL de test:', accessUrl);
    console.log('🔐 Credentials: admin/Rasulova75');
    console.log('🎯 Cible: https://stablediffusion.regispailler.fr');
    
    // Test de l'API proxy-access
    console.log('\n📡 Test de l\'API proxy-access...');
    const response = await fetch(accessUrl);
    
    console.log('📊 Statut de la réponse:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ API proxy-access répond correctement');
      
      // Si c'est une redirection, suivre l'URL
      if (response.headers.get('location')) {
        console.log('🔄 Redirection vers:', response.headers.get('location'));
      }
    } else {
      console.log('❌ Erreur API proxy-access:', response.statusText);
      const errorText = await response.text();
      console.log('📄 Contenu d\'erreur:', errorText);
    }
    
    // Test direct de l'URL Stable Diffusion
    console.log('\n🎨 Test direct de Stable Diffusion...');
    const authString = Buffer.from('admin:Rasulova75').toString('base64');
    
    const stableDiffusionResponse = await fetch('https://stablediffusion.regispailler.fr', {
      headers: {
        'Authorization': `Basic ${authString}`,
        'User-Agent': 'IAHome-Test/1.0'
      }
    });
    
    console.log('📊 Statut Stable Diffusion:', stableDiffusionResponse.status);
    
    if (stableDiffusionResponse.ok) {
      console.log('✅ Stable Diffusion accessible avec les credentials');
      const contentType = stableDiffusionResponse.headers.get('content-type');
      console.log('📄 Type de contenu:', contentType);
    } else {
      console.log('❌ Erreur accès Stable Diffusion:', stableDiffusionResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testStableDiffusionAccess()
  .then(() => {
    console.log('\n🎉 Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }); 