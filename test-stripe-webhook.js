require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey || !stripeKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const stripe = new Stripe(stripeKey);

async function testStripeWebhook() {
  console.log('🧪 Test du webhook Stripe');
  
  try {
    // 1. Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'formateur_tic@hotmail.com')
      .single();
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', user.email);
    
    // 2. Récupérer un module
    const { data: modules, error: modulesError } = await supabase
      .from('cartes')
      .select('id, title, price')
      .limit(1);
    
    if (modulesError || !modules.length) {
      console.error('❌ Erreur récupération modules:', modulesError);
      return;
    }
    
    const module = modules[0];
    console.log('✅ Module trouvé:', module.title, '€' + module.price);
    
    // 3. Compter les accès avant
    const { data: beforeAccess, error: beforeError } = await supabase
      .from('module_access')
      .select('id')
      .eq('user_id', user.id);
    
    if (beforeError) {
      console.error('❌ Erreur comptage accès:', beforeError);
      return;
    }
    
    console.log('📊 Accès avant test:', beforeAccess.length);
    
    // 4. Simuler un événement checkout.session.completed
    const webhookEvent = {
      id: 'evt_test_' + Date.now(),
      object: 'event',
      api_version: '2020-08-27',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          object: 'checkout.session',
          customer: 'cus_test_' + Date.now(),
          customer_email: user.email,
          metadata: {
            user_id: user.id,
            module_id: module.id,
            module_title: module.title
          },
          amount_total: Math.round(module.price * 100), // Stripe utilise les centimes
          currency: 'eur',
          payment_status: 'paid',
          status: 'complete'
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
    
    console.log('📤 Envoi du webhook simulé...');
    
    // 5. Envoyer le webhook à notre endpoint
    const response = await fetch('https://home.regispailler.fr/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 'test_signature'
      },
      body: JSON.stringify(webhookEvent)
    });
    
    console.log('📥 Réponse du webhook:', response.status, response.statusText);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('📄 Contenu de la réponse:', responseText);
    }
    
    // 6. Attendre un peu puis vérifier les accès
    console.log('⏳ Attente de 3 secondes...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 7. Compter les accès après
    const { data: afterAccess, error: afterError } = await supabase
      .from('module_access')
      .select('id, created_at, metadata')
      .eq('user_id', user.id);
    
    if (afterError) {
      console.error('❌ Erreur comptage accès après:', afterError);
      return;
    }
    
    console.log('📊 Accès après test:', afterAccess.length);
    
    if (afterAccess.length > beforeAccess.length) {
      console.log('✅ Nouveaux accès ajoutés par le webhook !');
      const newAccess = afterAccess.slice(beforeAccess.length);
      newAccess.forEach(acc => {
        console.log(`   - Nouvel accès: ${acc.id} (${acc.created_at})`);
      });
    } else {
      console.log('❌ Aucun nouvel accès ajouté par le webhook');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testStripeWebhook(); 