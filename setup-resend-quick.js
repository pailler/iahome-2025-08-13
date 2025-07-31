// Script de configuration rapide Resend
// Usage: node setup-resend-quick.js

const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration rapide Resend pour IA Home');
console.log('===========================================');

console.log('\n📋 Étapes à suivre :');
console.log('');

console.log('1️⃣  Créer un compte Resend :');
console.log('   • Allez sur https://resend.com');
console.log('   • Cliquez sur "Sign up"');
console.log('   • Créez votre compte (gratuit)');
console.log('');

console.log('2️⃣  Vérifier votre domaine :');
console.log('   • Dans le dashboard Resend, allez dans "Domains"');
console.log('   • Cliquez sur "Add Domain"');
console.log('   • Ajoutez votre domaine (ex: iahome.fr)');
console.log('   • Suivez les instructions pour configurer les DNS');
console.log('   • Ou utilisez le domaine de test fourni par Resend');
console.log('');

console.log('3️⃣  Créer une clé API :');
console.log('   • Dans le dashboard Resend, allez dans "API Keys"');
console.log('   • Cliquez sur "Create API Key"');
console.log('   • Donnez un nom (ex: "IA Home Production")');
console.log('   • Copiez la clé API (commence par "re_")');
console.log('');

console.log('4️⃣  Configurer les variables d\'environnement :');
console.log('   • Ouvrez votre fichier .env.local');
console.log('   • Ajoutez ces lignes :');
console.log('');

const envConfig = `# Configuration Email Resend
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_votre_cle_api_ici
RESEND_FROM_EMAIL=noreply@votre-domaine.com

# Configuration Webhook Stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_ici`;

console.log(envConfig);
console.log('');

console.log('5️⃣  Configurer le webhook Stripe :');
console.log('   • Allez dans votre dashboard Stripe');
console.log('   • Developers > Webhooks');
console.log('   • Add endpoint');
console.log('   • URL: https://home.regispailler.fr/api/webhooks/stripe');
console.log('   • Événements à sélectionner :');
console.log('     - checkout.session.completed');
console.log('     - payment_intent.succeeded');
console.log('     - invoice.payment_succeeded');
console.log('     - payment_intent.payment_failed');
console.log('     - invoice.payment_failed');
console.log('     - customer.subscription.deleted');
console.log('   • Copiez le secret webhook (commence par "whsec_")');
console.log('');

console.log('6️⃣  Tester la configuration :');
console.log('   • Redémarrez votre application : npm run dev');
console.log('   • Exécutez le test : node test-email-configuration.js');
console.log('   • Faites un test de paiement avec une carte de test Stripe');
console.log('');

console.log('📧 Types d\'emails qui seront envoyés :');
console.log('   • ✅ Confirmation de paiement');
console.log('   • ✅ Confirmation d\'abonnement');
console.log('   • ❌ Échec de paiement');
console.log('   • 📋 Annulation d\'abonnement');
console.log('');

console.log('🔧 Commandes utiles :');
console.log('   • Test email : node test-email-configuration.js');
console.log('   • Vérifier logs : npm run dev');
console.log('   • Dashboard Resend : https://resend.com/dashboard');
console.log('   • Dashboard Stripe : https://dashboard.stripe.com/webhooks');
console.log('');

console.log('📞 Support :');
console.log('   • Resend : https://resend.com/support');
console.log('   • Stripe : https://support.stripe.com');
console.log('   • IA Home : support@iahome.fr');
console.log('');

// Vérifier si le fichier .env.local existe
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Fichier .env.local trouvé');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('EMAIL_PROVIDER=resend')) {
    console.log('✅ EMAIL_PROVIDER=resend déjà configuré');
  } else {
    console.log('⚠️  EMAIL_PROVIDER=resend manquant dans .env.local');
  }
  
  if (envContent.includes('RESEND_API_KEY=')) {
    console.log('✅ RESEND_API_KEY trouvé dans .env.local');
  } else {
    console.log('⚠️  RESEND_API_KEY manquant dans .env.local');
  }
  
  if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
    console.log('✅ STRIPE_WEBHOOK_SECRET trouvé dans .env.local');
  } else {
    console.log('⚠️  STRIPE_WEBHOOK_SECRET manquant dans .env.local');
  }
} else {
  console.log('⚠️  Fichier .env.local non trouvé');
  console.log('   Créez-le avec les variables d\'environnement nécessaires');
}

console.log('\n🎯 Prochaines étapes :');
console.log('1. Suivez les étapes ci-dessus');
console.log('2. Testez avec : node test-email-configuration.js');
console.log('3. Faites un vrai test de paiement');
console.log('4. Vérifiez que les emails sont reçus');
console.log('');

console.log('✨ Configuration terminée !'); 