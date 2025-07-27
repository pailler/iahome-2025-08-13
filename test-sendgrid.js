// Script de test pour SendGrid
require('dotenv').config({ path: '.env.local' });

const sgMail = require('@sendgrid/mail');

// Configuration SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testSendGrid() {
  try {
    console.log('🧪 Test de configuration SendGrid...');
    console.log('API Key:', process.env.SENDGRID_API_KEY ? '✅ Présente' : '❌ Manquante');
    console.log('From Email:', process.env.SENDGRID_FROM_EMAIL || 'noreply@iahome.com');
    
    const msg = {
      to: 'test@example.com', // Remplacez par votre email
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@iahome.com',
      subject: '🧪 Test SendGrid - IA Home',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🧪 Test SendGrid</h2>
          <p>Ceci est un test de configuration SendGrid pour IA Home.</p>
          <p>Si vous recevez cet email, la configuration est correcte !</p>
          <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      `
    };
    
    console.log('📧 Envoi du test...');
    await sgMail.send(msg);
    console.log('✅ Email de test envoyé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.body);
    }
  }
}

testSendGrid(); 