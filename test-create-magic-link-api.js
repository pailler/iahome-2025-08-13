const fetch = require('node-fetch');

async function testCreateMagicLinkAPI() {
  try {
    console.log('🧪 Test de l\'API create-magic-link...');
    
    const requestBody = {
      userId: '4ff83788-7bdb-4633-a693-3ad98006fed5',
      subscriptionId: 'iatube-sub-789',
      moduleName: 'iatube',
      userEmail: 'regispailler@gmail.com',
      redirectUrl: 'https://www.google.com'
    };
    
    console.log('📋 Request body:', requestBody);
    
    const response = await fetch('http://localhost:8021/api/create-magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('🔍 Response text:', responseText);
    
    if (response.ok) {
      const responseData = JSON.parse(responseText);
      console.log('✅ API call successful!');
      console.log('📋 Response data:', responseData);
      
      if (responseData.data?.token) {
        console.log('🔗 Token:', responseData.data.token);
        console.log('🔗 Magic link URL:', responseData.data.magicLinkUrl);
        
        // Test de l'URL d'accès
        const accessUrl = `http://localhost:8021/access/test-module?token=${responseData.data.token}&user=${requestBody.userId}`;
        console.log('🔗 Access URL:', accessUrl);
      }
    } else {
      console.error('❌ API call failed!');
      try {
        const errorData = JSON.parse(responseText);
        console.error('❌ Error details:', errorData);
      } catch (e) {
        console.error('❌ Error response (not JSON):', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Script principal
(async () => {
  console.log('🚀 Test de l\'API create-magic-link...\n');
  
  await testCreateMagicLinkAPI();
  
  console.log('\n🎉 Test terminé !');
})();