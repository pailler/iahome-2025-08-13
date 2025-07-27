const fetch = require('node-fetch');

async function createMagicLinkViaAPI() {
  try {
    console.log('🔍 Création d\'un magic link via l\'API...\n');
    
    // Données de test pour l'API
    const testData = {
      userId: 'test-user-123',
      subscriptionId: 'test-sub-456',
      moduleName: 'test-module',
      userEmail: 'test@example.com',
      redirectUrl: 'https://test.example.com/access'
    };

    console.log('📋 Données de test:', testData);

    // URL de l'API (ajustez selon votre configuration)
    const apiUrl = 'http://localhost:8021/api/create-magic-link';
    
    console.log('🌐 Appel de l\'API:', apiUrl);

    // Appel à l'API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur API:', response.status, result);
      return;
    }

    console.log('✅ Magic link créé avec succès !');
    console.log('📋 Réponse de l\'API:');
    console.log('   - Success:', result.success);
    console.log('   - Message:', result.message);
    console.log('   - ID:', result.data.id);
    console.log('   - Token:', result.data.token);
    console.log('   - Expiration:', result.data.expiresAt);
    console.log('   - URL:', result.data.magicLinkUrl);

    console.log('\n🧪 Pour tester ce magic link:');
    console.log('1. Copiez l\'URL ci-dessus');
    console.log('2. Ouvrez-la dans un navigateur');
    console.log('3. Vérifiez que l\'accès fonctionne');

  } catch (error) {
    console.error('❌ Erreur lors de la création du magic link:', error);
    console.log('\n💡 Vérifiez que:');
    console.log('   - Le serveur Next.js est démarré (npm run dev)');
    console.log('   - L\'API est accessible sur http://localhost:8021');
    console.log('   - Les variables d\'environnement Supabase sont configurées');
  }
}

// Exécuter le script
createMagicLinkViaAPI()
  .then(() => {
    console.log('\n🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });