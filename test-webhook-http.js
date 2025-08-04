require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');

async function testWebhookHttp() {
  console.log('🌐 Test HTTP du webhook Stripe...');
  
  // URL du webhook
  const webhookUrl = 'http://localhost:3000/api/webhooks/stripe';
  
  // Créer un événement de test
  const testEvent = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    api_version: '2025-06-30.basil',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'pi_test_' + Date.now(),
        object: 'payment_intent',
        amount: 990,
        currency: 'eur',
        status: 'succeeded',
        metadata: {
          customer_email: 'regispailler@gmail.com',
          items_ids: '15',
        },
        customer_email: 'regispailler@gmail.com',
        amount_total: 990,
        customer_details: {
          email: 'regispailler@gmail.com'
        }
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_' + Date.now(),
      idempotency_key: null
    },
    type: 'payment_intent.succeeded'
  };
  
  // Créer la signature Stripe (simulation)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = `t=${timestamp},v1=test_signature_${Date.now()}`;
  
  console.log('📋 Configuration de la requête:');
  console.log('URL:', webhookUrl);
  console.log('Type d\'événement:', testEvent.type);
  console.log('Email client:', testEvent.data.object.metadata.customer_email);
  console.log('IDs modules:', testEvent.data.object.metadata.items_ids);
  
  // Préparer la requête
  const postData = JSON.stringify(testEvent);
  const url = new URL(webhookUrl);
  
  const options = {
    hostname: url.hostname,
    port: url.port || 3000,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('\n📤 Envoi de la requête...');
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
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
    
    req.write(postData);
    req.end();
  });
}

// Fonction pour tester avec un vrai événement Stripe
async function testWithRealStripeEvent() {
  console.log('\n🧪 Test avec un vrai événement Stripe...');
  
  // Créer un vrai événement Stripe
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    // Créer un payment intent de test
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 990,
      currency: 'eur',
      metadata: {
        customer_email: 'regispailler@gmail.com',
        items_ids: '15'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log('✅ Payment Intent créé:', paymentIntent.id);
    
    // Simuler un événement de succès
    const event = {
      id: 'evt_test_' + Date.now(),
      object: 'event',
      api_version: '2025-06-30.basil',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          ...paymentIntent,
          status: 'succeeded',
          customer_email: 'regispailler@gmail.com',
          amount_total: 990,
          customer_details: {
            email: 'regispailler@gmail.com'
          }
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: 'req_test_' + Date.now(),
        idempotency_key: null
      },
      type: 'payment_intent.succeeded'
    };
    
    console.log('📋 Événement créé:', {
      type: event.type,
      payment_intent_id: event.data.object.id,
      customer_email: event.data.object.metadata.customer_email,
      items_ids: event.data.object.metadata.items_ids
    });
    
    // Envoyer au webhook
    await testWebhookHttp();
    
  } catch (error) {
    console.error('❌ Erreur création Payment Intent:', error);
  }
}

// Exécuter les tests
async function runTests() {
  try {
    await testWebhookHttp();
    await testWithRealStripeEvent();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

runTests(); 