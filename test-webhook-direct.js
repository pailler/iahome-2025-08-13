require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');
const crypto = require('crypto');

async function testWebhookDirect() {
  console.log('🌐 Test direct du webhook Stripe...');
  
  // URL du webhook (production)
  const webhookUrl = 'https://home.regispailler.fr/api/webhooks/stripe';
  
  // Créer un événement de test basé sur un vrai événement
  const testEvent = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    api_version: '2025-06-30.basil',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'cs_test_' + Date.now(),
        object: 'checkout.session',
        amount_total: 990,
        currency: 'eur',
        status: 'complete',
        payment_status: 'paid',
        customer_email: 'regispailler@gmail.com',
        metadata: {
          customer_email: 'regispailler@gmail.com',
          items_count: '1',
          items_ids: '15',
          total_amount: '09.9',
          type: 'payment'
        }
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_' + Date.now(),
      idempotency_key: null
    },
    type: 'checkout.session.completed'
  };
  
  // Créer la signature Stripe
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify(testEvent);
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  
  const stripeSignature = `t=${timestamp},v1=${signature}`;
  
  console.log('📋 Configuration de la requête:');
  console.log('URL:', webhookUrl);
  console.log('Type d\'événement:', testEvent.type);
  console.log('Email client:', testEvent.data.object.metadata.customer_email);
  console.log('IDs modules:', testEvent.data.object.metadata.items_ids);
  console.log('Timestamp:', timestamp);
  console.log('Signature:', stripeSignature.substring(0, 50) + '...');
  
  // Préparer la requête
  const url = new URL(webhookUrl);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': stripeSignature,
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  
  console.log('\n📤 Envoi de la requête...');
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('📥 Réponse reçue:');
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Corps de la réponse:', data);
        
        if (res.statusCode === 200) {
          console.log('✅ Webhook traité avec succès');
        } else {
          console.log('❌ Erreur webhook:', res.statusCode);
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erreur de requête:', error);
      reject(error);
    });
    
    req.write(payload);
    req.end();
  });
}

// Fonction pour tester avec un vrai événement Stripe
async function testWithRealStripeEvent() {
  console.log('\n🧪 Test avec un vrai événement Stripe...');
  
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
  });
  
  try {
    // Récupérer un événement récent
    const events = await stripe.events.list({
      limit: 1,
      types: ['checkout.session.completed']
    });
    
    if (events.data.length === 0) {
      console.log('❌ Aucun événement checkout.session.completed trouvé');
      return;
    }
    
    const realEvent = events.data[0];
    console.log('📋 Événement réel trouvé:', realEvent.id);
    console.log('Type:', realEvent.type);
    console.log('Créé:', new Date(realEvent.created * 1000).toLocaleString());
    
    // Créer la signature pour l'événement réel
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const payload = JSON.stringify(realEvent);
    const timestamp = realEvent.created;
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    
    const stripeSignature = `t=${timestamp},v1=${signature}`;
    
    console.log('📋 Envoi de l\'événement réel au webhook...');
    
    // Envoyer l'événement réel
    const webhookUrl = 'https://home.regispailler.fr/api/webhooks/stripe';
    const url = new URL(webhookUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature,
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        console.log('📥 Réponse reçue:');
        console.log('Status:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('📄 Corps de la réponse:', data);
          
          if (res.statusCode === 200) {
            console.log('✅ Webhook traité avec succès');
          } else {
            console.log('❌ Erreur webhook:', res.statusCode);
          }
          
          resolve();
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Erreur de requête:', error);
        reject(error);
      });
      
      req.write(payload);
      req.end();
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération événement:', error);
  }
}

// Exécuter les tests
async function runTests() {
  try {
    await testWebhookDirect();
    await testWithRealStripeEvent();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

runTests(); 