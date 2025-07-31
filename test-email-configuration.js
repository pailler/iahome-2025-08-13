// Script de test pour vérifier la configuration email
// Usage: node test-email-configuration.js

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Test de configuration email');
console.log('==============================');

// Vérifier les variables d'environnement
console.log('\n📋 Variables d\'environnement :');
console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'console (par défaut)');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configuré' : '❌ Manquant');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Configuré' : '❌ Manquant');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Non configuré');
console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '❌ Non configuré');

// Vérifier la configuration Stripe
console.log('\n💳 Configuration Stripe :');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Configuré' : '❌ Manquant');
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configuré' : '❌ Manquant');

// Test du service email
async function testEmailService() {
  console.log('\n📧 Test du service email :');
  
  try {
    // Importer le service email
    const { emailService } = require('./src/utils/emailService');
    
    console.log('✅ Service email importé avec succès');
    
    // Test d'envoi d'email
    const testEmail = {
      to: 'test@example.com',
      subject: '🧪 Test de configuration - IA Home',
      html: `
        <h2>Test de configuration email</h2>
        <p>Cet email a été envoyé pour tester la configuration du service email.</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <p><strong>Provider:</strong> ${process.env.EMAIL_PROVIDER || 'console'}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Si vous recevez cet email, la configuration est correcte !
        </p>
      `
    };
    
    console.log('📤 Tentative d\'envoi d\'email de test...');
    const result = await emailService.sendEmail(testEmail);
    
    if (result) {
      console.log('✅ Email envoyé avec succès !');
    } else {
      console.log('❌ Échec de l\'envoi d\'email');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test du service email:', error.message);
  }
}

// Test de simulation de webhook Stripe
async function testStripeWebhook() {
  console.log('\n🔄 Test de simulation webhook Stripe :');
  
  try {
    // Simuler un événement de paiement réussi
    const mockPaymentEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123456789',
          customer_email: 'test@example.com',
          amount_total: 2000, // 20€ en centimes
          metadata: {
            items: JSON.stringify([
              { title: 'Module IA Test', price: 2000 }
            ])
          }
        }
      }
    };
    
    console.log('📋 Événement simulé:', mockPaymentEvent.type);
    console.log('📧 Email client:', mockPaymentEvent.data.object.customer_email);
    console.log('💰 Montant:', (mockPaymentEvent.data.object.amount_total / 100) + '€');
    
    // Importer le service email pour tester l'envoi de confirmation
    const { emailService } = require('./src/utils/emailService');
    
    const items = JSON.parse(mockPaymentEvent.data.object.metadata.items);
    const success = await emailService.sendPaymentConfirmation(
      mockPaymentEvent.data.object.customer_email,
      mockPaymentEvent.data.object.amount_total,
      items,
      mockPaymentEvent.data.object.id
    );
    
    if (success) {
      console.log('✅ Email de confirmation de paiement envoyé !');
    } else {
      console.log('❌ Échec de l\'envoi de l\'email de confirmation');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test webhook:', error.message);
  }
}

// Fonction principale
async function runTests() {
  await testEmailService();
  await testStripeWebhook();
  
  console.log('\n📊 Résumé des tests :');
  console.log('=====================');
  
  if (process.env.EMAIL_PROVIDER === 'resend' && process.env.RESEND_API_KEY) {
    console.log('✅ Resend configuré correctement');
  } else if (process.env.EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    console.log('✅ SendGrid configuré correctement');
  } else {
    console.log('⚠️  Aucun service email configuré - emails affichés dans la console uniquement');
  }
  
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('✅ Webhook Stripe configuré');
  } else {
    console.log('⚠️  Webhook Stripe non configuré');
  }
  
  console.log('\n📝 Prochaines étapes :');
  console.log('1. Configurez un service email (Resend ou SendGrid)');
  console.log('2. Ajoutez STRIPE_WEBHOOK_SECRET dans vos variables d\'environnement');
  console.log('3. Redémarrez votre application');
  console.log('4. Testez un vrai paiement avec une carte de test Stripe');
}

// Exécuter les tests
runTests().catch(console.error); 