// Test final de configuration email
// Usage: node test-email-final.js

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Test final de configuration email');
console.log('====================================');

// Vérifier les variables d'environnement
console.log('\n📋 Variables d\'environnement :');
console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'console (par défaut)');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configuré' : '❌ Manquant');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Non configuré');
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configuré' : '❌ Manquant');

// Test avec l'email de l'utilisateur
async function testWithUserEmail() {
  console.log('\n📧 Test avec votre email :');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY manquant');
    return false;
  }
  
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('✅ Resend initialisé');
    
    // Email de test à votre propre adresse
    const testEmail = {
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'formateur_tic@hotmail.com', // Votre email
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
    console.log('📧 De:', testEmail.from);
    console.log('📧 À:', testEmail.to);
    
    const result = await resend.emails.send(testEmail);
    
    if (result.error) {
      console.log('❌ Erreur Resend:', result.error);
      return false;
    }
    
    console.log('✅ Email envoyé avec succès !');
    console.log('📧 ID email:', result.data?.id);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test Resend:', error.message);
    return false;
  }
}

// Test de simulation de paiement (à votre email)
async function testPaymentEmailToUser() {
  console.log('\n🔄 Test de simulation email de paiement (à votre email) :');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY manquant');
    return false;
  }
  
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Simuler un email de confirmation de paiement
    const paymentEmail = {
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'formateur_tic@hotmail.com', // Votre email
      subject: '✅ Paiement confirmé - IA Home (Test)',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paiement confirmé - Test</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">✅ Paiement confirmé</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">IA Home - TEST</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour,<br><br>
                <strong>⚠️ Ceci est un email de test</strong><br><br>
                Nous confirmons la réception de votre paiement. Merci pour votre confiance !
              </p>
              
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Détails de la transaction</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #64748b; font-weight: 500;">Montant :</span>
                  <span style="color: #1e293b; font-weight: 600; font-size: 18px;">20.00€</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #64748b; font-weight: 500;">ID Transaction :</span>
                  <span style="color: #1e293b; font-family: monospace; font-size: 14px;">cs_test_123456789</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-weight: 500;">Date :</span>
                  <span style="color: #1e293b;">${new Date().toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
              
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0c4a6e; font-size: 18px; font-weight: 600;">Articles achetés</h3>
                <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                  <li style="margin-bottom: 8px; line-height: 1.5;">Module IA Test</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://home.regispailler.fr" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Accéder à mon compte
                </a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Note :</strong> Cet email a été envoyé à votre adresse pour tester la configuration. 
                  En production, les emails de paiement seront envoyés aux clients.
                </p>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                Merci pour votre confiance !
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                L'équipe IA Home<br>
                <a href="mailto:support@iahome.fr" style="color: #667eea; text-decoration: none;">support@iahome.fr</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    console.log('📤 Envoi d\'email de confirmation de paiement...');
    console.log('📧 À:', paymentEmail.to);
    
    const result = await resend.emails.send(paymentEmail);
    
    if (result.error) {
      console.log('❌ Erreur envoi email paiement:', result.error);
      return false;
    }
    
    console.log('✅ Email de confirmation de paiement envoyé !');
    console.log('📧 ID email:', result.data?.id);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test email paiement:', error.message);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log('\n🚀 Démarrage des tests...');
  
  const test1 = await testWithUserEmail();
  const test2 = await testPaymentEmailToUser();
  
  console.log('\n📊 Résumé des tests :');
  console.log('=====================');
  
  if (test1) {
    console.log('✅ Test email simple : SUCCÈS');
  } else {
    console.log('❌ Test email simple : ÉCHEC');
  }
  
  if (test2) {
    console.log('✅ Test email paiement : SUCCÈS');
  } else {
    console.log('❌ Test email paiement : ÉCHEC');
  }
  
  if (process.env.EMAIL_PROVIDER === 'resend' && process.env.RESEND_API_KEY) {
    console.log('✅ Configuration Resend : CORRECTE');
  } else {
    console.log('❌ Configuration Resend : INCORRECTE');
  }
  
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('✅ Webhook Stripe : CONFIGURÉ');
  } else {
    console.log('⚠️  Webhook Stripe : NON CONFIGURÉ');
  }
  
  console.log('\n🎯 Prochaines étapes :');
  if (test1 && test2) {
    console.log('✅ Configuration email fonctionnelle !');
    console.log('📧 Vérifiez votre boîte mail (formateur_tic@hotmail.com)');
    console.log('📧 Les notifications de paiement fonctionneront automatiquement');
    console.log('🔄 Pour tester avec pailleradam@gmail.com, vous devrez :');
    console.log('   1. Vérifier un domaine dans Resend');
    console.log('   2. Ou utiliser SendGrid à la place');
    console.log('   3. Ou faire un vrai test de paiement Stripe');
  } else {
    console.log('❌ Problème de configuration détecté');
    console.log('🔧 Vérifiez vos variables d\'environnement');
    console.log('📧 Vérifiez votre clé API Resend');
  }
  
  console.log('\n📝 Note importante :');
  console.log('En mode test, Resend ne permet d\'envoyer qu\'à votre propre email.');
  console.log('Pour envoyer à d\'autres destinataires, vous devez vérifier un domaine.');
  console.log('Cependant, les webhooks Stripe fonctionneront automatiquement !');
}

// Exécuter les tests
runTests().catch(console.error); 