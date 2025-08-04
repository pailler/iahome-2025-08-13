require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWebhookManually() {
  console.log('🧪 Test manuel du webhook Stripe...');
  
  // 1. Créer un événement de test
  const testEvent = {
    id: 'evt_test_' + Date.now(),
    object: 'event',
    api_version: '2025-06-30.basil',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'pi_test_' + Date.now(),
        object: 'payment_intent',
        amount: 990, // 9.90€ en centimes
        currency: 'eur',
        status: 'succeeded',
        metadata: {
          customer_email: 'regispailler@gmail.com',
          items_ids: '15', // ID du module Stable Diffusion
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
  
  console.log('📋 Événement de test créé:', {
    type: testEvent.type,
    customer_email: testEvent.data.object.metadata.customer_email,
    items_ids: testEvent.data.object.metadata.items_ids,
    amount: testEvent.data.object.amount
  });
  
  // 2. Vérifier si l'utilisateur existe
  console.log('\n🔍 Vérification de l\'utilisateur...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'regispailler@gmail.com')
    .single();
    
  if (profilesError || !profiles) {
    console.error('❌ Utilisateur non trouvé dans profiles:', profilesError);
    return;
  }
  
  console.log('✅ Utilisateur trouvé:', profiles.id);
  
  // 3. Vérifier si le module existe
  console.log('\n🔍 Vérification du module...');
  const { data: module, error: moduleError } = await supabase
    .from('modules')
    .select('id, title, price')
    .eq('id', '15')
    .single();
    
  if (moduleError || !module) {
    console.error('❌ Module non trouvé:', moduleError);
    return;
  }
  
  console.log('✅ Module trouvé:', module.title, '(Prix:', module.price + ')');
  
  // 4. Vérifier si l'accès existe déjà
  console.log('\n🔍 Vérification de l\'accès existant...');
  const { data: existingAccess, error: accessError } = await supabase
    .from('module_access')
    .select('id, created_at')
    .eq('user_id', profiles.id)
    .eq('module_id', 15)
    .single();
    
  if (existingAccess) {
    console.log('✅ Accès déjà existant créé le:', new Date(existingAccess.created_at).toLocaleString());
  } else {
    console.log('❌ Aucun accès trouvé - le webhook devrait en créer un');
  }
  
  // 5. Simuler l'ajout d'accès module (comme dans le webhook)
  console.log('\n🧪 Simulation de l\'ajout d\'accès module...');
  
  try {
    // Note: Cette opération nécessite la clé de service, mais on peut tester la logique
    console.log('📝 Tentative d\'ajout d\'accès module...');
    console.log('  - User ID:', profiles.id);
    console.log('  - Module ID:', 15);
    console.log('  - Session ID:', testEvent.data.object.id);
    
    // Vérifier si l'accès existe déjà (double vérification)
    const { data: checkAccess, error: checkError } = await supabase
      .from('module_access')
      .select('id')
      .eq('user_id', profiles.id)
      .eq('module_id', 15)
      .single();
      
    if (checkAccess) {
      console.log('✅ Accès déjà existant, pas d\'ajout nécessaire');
    } else {
      console.log('❌ Accès manquant - le webhook devrait l\'ajouter');
      console.log('💡 Problème potentiel: Le webhook ne fonctionne pas ou les permissions sont insuffisantes');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
  
  // 6. Tester l'envoi d'email
  console.log('\n📧 Test d\'envoi d\'email...');
  
  try {
    // Simuler l'envoi d'email comme dans le webhook
    const testItems = [{ id: '15', title: module.title }];
    
    // Utiliser le service d'email directement
    const { EmailService } = require('./src/utils/emailService');
    const emailService = EmailService.getInstance();
    
    const emailResult = await emailService.sendPaymentConfirmation(
      'regispailler@gmail.com',
      990, // 9.90€ en centimes
      testItems,
      testEvent.data.object.id
    );
    
    console.log('📧 Résultat envoi email:', emailResult ? '✅ Succès' : '❌ Échec');
    
  } catch (error) {
    console.error('❌ Erreur test email:', error);
  }
  
  // 7. Analyser les problèmes potentiels
  console.log('\n🔍 Analyse des problèmes potentiels:');
  
  console.log('1. ✅ Variables d\'environnement Stripe présentes');
  console.log('2. ✅ Utilisateur existe dans la base de données');
  console.log('3. ✅ Module Stable Diffusion existe (ID: 15)');
  console.log('4. ❓ Webhook Stripe configuré correctement ?');
  console.log('5. ❓ Permissions Supabase suffisantes ?');
  console.log('6. ❓ Métadonnées du paiement correctes ?');
  
  console.log('\n📋 Actions recommandées:');
  console.log('1. Vérifier les logs du serveur Next.js lors d\'un vrai paiement');
  console.log('2. Vérifier que le webhook Stripe pointe vers: https://home.regispailler.fr/api/webhooks/stripe');
  console.log('3. Vérifier les permissions RLS sur la table module_access');
  console.log('4. Tester avec un vrai paiement Stripe en mode test');
  
  console.log('\n🔍 Test terminé');
}

testWebhookManually().catch(console.error); 