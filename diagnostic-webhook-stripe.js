// Script de diagnostic pour les webhooks Stripe
// Usage: node diagnostic-webhook-stripe.js

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Diagnostic des webhooks Stripe');
console.log('==================================');

// Vérifier les variables d'environnement
console.log('\n📋 Variables d\'environnement :');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Configuré' : '❌ Manquant');
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configuré' : '❌ Manquant');
console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'console (par défaut)');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configuré' : '❌ Manquant');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Non configuré');

// Test de connexion Stripe
async function testStripeConnection() {
  console.log('\n💳 Test de connexion Stripe :');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY manquant');
    return false;
  }
  
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });
    
    console.log('✅ Stripe initialisé');
    
    // Récupérer les webhooks configurés
    const webhooks = await stripe.webhookEndpoints.list();
    
    console.log('📋 Webhooks configurés :');
    if (webhooks.data.length === 0) {
      console.log('❌ Aucun webhook configuré');
      return false;
    }
    
    webhooks.data.forEach((webhook, index) => {
      console.log(`\n${index + 1}. Webhook ID: ${webhook.id}`);
      console.log(`   URL: ${webhook.url}`);
      console.log(`   Statut: ${webhook.status}`);
      console.log(`   Événements: ${webhook.enabled_events.join(', ')}`);
      
      // Vérifier si l'URL correspond à votre application
      if (webhook.url.includes('home.regispailler.fr')) {
        console.log('   ✅ URL correspond à votre application');
      } else {
        console.log('   ⚠️  URL ne correspond pas à votre application');
      }
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test Stripe:', error.message);
    return false;
  }
}

// Test de simulation de webhook
async function testWebhookSimulation() {
  console.log('\n🔄 Test de simulation webhook :');
  
  try {
    // Simuler un événement de paiement réussi
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_simulation',
          customer_email: 'formateur_tic@hotmail.com',
          amount_total: 2000,
          metadata: {
            items: JSON.stringify([
              { title: 'Module IA Test', price: 2000 }
            ])
          }
        }
      }
    };
    
    console.log('📋 Événement simulé:', mockEvent.type);
    console.log('📧 Email client:', mockEvent.data.object.customer_email);
    console.log('💰 Montant:', (mockEvent.data.object.amount_total / 100) + '€');
    
    // Test du service email
    const { emailService } = require('./src/utils/emailService');
    
    const items = JSON.parse(mockEvent.data.object.metadata.items);
    const success = await emailService.sendPaymentConfirmation(
      mockEvent.data.object.customer_email,
      mockEvent.data.object.amount_total,
      items,
      mockEvent.data.object.id
    );
    
    if (success) {
      console.log('✅ Email de confirmation envoyé avec succès !');
      return true;
    } else {
      console.log('❌ Échec de l\'envoi de l\'email de confirmation');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test webhook:', error.message);
    return false;
  }
}

// Test de l'endpoint webhook
async function testWebhookEndpoint() {
  console.log('\n🌐 Test de l\'endpoint webhook :');
  
  try {
    const https = require('https');
    const url = 'https://home.regispailler.fr/api/webhooks/stripe';
    
    console.log('📡 Test de connectivité vers:', url);
    
    // Test simple de connectivité
    const testRequest = () => {
      return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'GET' }, (res) => {
          console.log('📊 Statut HTTP:', res.statusCode);
          console.log('📋 Headers:', res.headers);
          resolve(res.statusCode);
        });
        
        req.on('error', (error) => {
          console.log('❌ Erreur de connexion:', error.message);
          reject(error);
        });
        
        req.setTimeout(5000, () => {
          console.log('⏰ Timeout de la requête');
          req.destroy();
          reject(new Error('Timeout'));
        });
        
        req.end();
      });
    };
    
    const statusCode = await testRequest();
    
    if (statusCode === 405) {
      console.log('✅ Endpoint accessible (405 = Method Not Allowed, normal pour GET)');
      return true;
    } else if (statusCode === 200) {
      console.log('✅ Endpoint accessible');
      return true;
    } else {
      console.log('⚠️  Endpoint accessible mais statut inattendu:', statusCode);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Endpoint inaccessible:', error.message);
    return false;
  }
}

// Vérifier les logs récents
function checkRecentLogs() {
  console.log('\n📝 Vérification des logs :');
  
  console.log('🔍 Vérifiez les logs de votre serveur pour voir :');
  console.log('   - "Webhook reçu: checkout.session.completed"');
  console.log('   - "📧 Email envoyé via Resend: formateur_tic@hotmail.com"');
  console.log('   - "✅ Paiement confirmé pour la session: [ID]"');
  
  console.log('\n🔍 Vérifiez le dashboard Stripe :');
  console.log('   - Allez dans "Developers" > "Webhooks"');
  console.log('   - Cliquez sur votre webhook');
  console.log('   - Vérifiez les tentatives récentes');
  console.log('   - Regardez les codes de statut HTTP');
}

// Fonction principale
async function runDiagnostic() {
  console.log('\n🚀 Démarrage du diagnostic...');
  
  const test1 = await testStripeConnection();
  const test2 = await testWebhookSimulation();
  const test3 = await testWebhookEndpoint();
  
  console.log('\n📊 Résumé du diagnostic :');
  console.log('==========================');
  
  if (test1) {
    console.log('✅ Connexion Stripe : OK');
  } else {
    console.log('❌ Connexion Stripe : ÉCHEC');
  }
  
  if (test2) {
    console.log('✅ Simulation webhook : OK');
  } else {
    console.log('❌ Simulation webhook : ÉCHEC');
  }
  
  if (test3) {
    console.log('✅ Endpoint webhook : OK');
  } else {
    console.log('❌ Endpoint webhook : ÉCHEC');
  }
  
  checkRecentLogs();
  
  console.log('\n🎯 Prochaines étapes :');
  if (test1 && test2 && test3) {
    console.log('✅ Configuration correcte détectée');
    console.log('🔍 Le problème peut venir de :');
    console.log('   1. Le webhook Stripe n\'est pas configuré correctement');
    console.log('   2. L\'URL du webhook ne correspond pas');
    console.log('   3. Le serveur n\'était pas démarré lors du paiement');
    console.log('   4. Les logs montrent des erreurs spécifiques');
  } else {
    console.log('❌ Problèmes de configuration détectés');
    console.log('🔧 Corrigez les problèmes ci-dessus');
  }
  
  console.log('\n📞 Actions recommandées :');
  console.log('1. Vérifiez les logs de votre serveur');
  console.log('2. Vérifiez le dashboard Stripe > Webhooks');
  console.log('3. Refaites un test de paiement');
  console.log('4. Vérifiez que le serveur est bien démarré');
}

// Exécuter le diagnostic
runDiagnostic().catch(console.error); 