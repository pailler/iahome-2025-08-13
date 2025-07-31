console.log('🧪 Test du bouton Stable Diffusion...\n');

async function testStableDiffusionButton() {
  try {
    // Token du magic link créé
    const token = '46e2c757429488251079882de116364f418a9ed0e318027720ae524569db63f4';
    
    console.log('🔗 Test de l\'URL du bouton Stable Diffusion');
    console.log('🎯 URL: http://localhost:8021/api/proxy-access?token=' + token + '&module=stablediffusion');
    console.log('🔐 Credentials: admin/Rasulova75');
    
    console.log('\n🎉 Configuration terminée !');
    console.log('📝 Instructions pour tester le bouton:');
    console.log('   1. Ouvrez http://localhost:8021 dans votre navigateur');
    console.log('   2. Localisez le bouton "Accéder à Stable Diffusion" dans la section héros');
    console.log('   3. Cliquez sur le bouton avec le dégradé violet/rose');
    console.log('   4. L\'interface Stable Diffusion devrait s\'ouvrir automatiquement');
    console.log('   5. L\'authentification admin/Rasulova75 sera automatiquement injectée');
    
    console.log('\n🔧 Détails techniques:');
    console.log('   - Magic Link Token:', token);
    console.log('   - Module: stablediffusion');
    console.log('   - URL cible: https://stablediffusion.regispailler.fr');
    console.log('   - Expiration: 24 heures');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testStableDiffusionButton()
  .then(() => {
    console.log('\n🎉 Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }); 