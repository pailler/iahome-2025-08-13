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

async function debugStripeWebhook() {
  console.log('🔍 Diagnostic approfondi du webhook Stripe...');
  
  // 1. Vérifier la configuration Stripe
  console.log('\n📋 Configuration Stripe:');
  console.log('Mode:', process.env.STRIPE_SECRET_KEY?.includes('sk_test_') ? 'Test' : 'Live');
  console.log('Webhook Secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Configuré' : 'Manquant');
  
  // 2. Vérifier les webhooks configurés dans Stripe
  console.log('\n📋 Webhooks Stripe configurés:');
  try {
    const webhooks = await stripe.webhookEndpoints.list();
    console.log('✅ Webhooks trouvés:', webhooks.data.length);
    
    webhooks.data.forEach((webhook, index) => {
      console.log(`  ${index + 1}. URL: ${webhook.url}`);
      console.log(`     Status: ${webhook.status}`);
      console.log(`     Événements: ${webhook.enabled_events.join(', ')}`);
      console.log(`     Créé: ${new Date(webhook.created * 1000).toLocaleString()}`);
      console.log('');
    });
    
    // Vérifier si notre webhook est configuré
    const ourWebhook = webhooks.data.find(w => 
      w.url.includes('home.regispailler.fr/api/webhooks/stripe') ||
      w.url.includes('localhost:3000/api/webhooks/stripe')
    );
    
    if (ourWebhook) {
      console.log('✅ Notre webhook est configuré:', ourWebhook.url);
      console.log('Status:', ourWebhook.status);
    } else {
      console.log('❌ Notre webhook n\'est PAS configuré dans Stripe');
      console.log('💡 Il faut configurer le webhook vers: https://home.regispailler.fr/api/webhooks/stripe');
    }
    
  } catch (error) {
    console.error('❌ Erreur récupération webhooks:', error.message);
  }
  
  // 3. Vérifier les événements récents
  console.log('\n📋 Événements Stripe récents:');
  try {
    const events = await stripe.events.list({
      limit: 10,
      types: ['payment_intent.succeeded', 'checkout.session.completed']
    });
    
    console.log('✅ Événements trouvés:', events.data.length);
    
    events.data.forEach((event, index) => {
      console.log(`  ${index + 1}. Type: ${event.type}`);
      console.log(`     ID: ${event.id}`);
      console.log(`     Créé: ${new Date(event.created * 1000).toLocaleString()}`);
      
      // Vérifier les métadonnées
      if (event.data.object.metadata) {
        console.log(`     Métadonnées:`, event.data.object.metadata);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération événements:', error.message);
  }
  
  // 4. Vérifier les paiements récents
  console.log('\n📋 Paiements récents:');
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 10
    });
    
    console.log('✅ Paiements trouvés:', paymentIntents.data.length);
    
    paymentIntents.data.forEach((pi, index) => {
      console.log(`  ${index + 1}. ID: ${pi.id}`);
      console.log(`     Status: ${pi.status}`);
      console.log(`     Montant: ${pi.amount} ${pi.currency}`);
      console.log(`     Créé: ${new Date(pi.created * 1000).toLocaleString()}`);
      
      if (pi.metadata) {
        console.log(`     Métadonnées:`, pi.metadata);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur récupération paiements:', error.message);
  }
  
  // 5. Vérifier les accès modules dans la base de données
  console.log('\n📋 Accès modules dans la base de données:');
  const { data: moduleAccess, error: accessError } = await supabase
    .from('module_access')
    .select(`
      id,
      user_id,
      module_id,
      access_type,
      created_at,
      metadata,
      modules!inner(title)
    `)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (accessError) {
    console.error('❌ Erreur récupération accès modules:', accessError);
  } else {
    console.log('✅ Accès modules trouvés:', moduleAccess.length);
    moduleAccess.forEach((access, index) => {
      console.log(`  ${index + 1}. ID: ${access.id}`);
      console.log(`     User: ${access.user_id}`);
      console.log(`     Module: ${access.modules.title} (ID: ${access.module_id})`);
      console.log(`     Type: ${access.access_type}`);
      console.log(`     Créé: ${new Date(access.created_at).toLocaleString()}`);
      
      if (access.metadata) {
        console.log(`     Métadonnées:`, access.metadata);
      }
      
      console.log('');
    });
  }
  
  // 6. Analyser le problème
  console.log('\n🔍 Analyse du problème:');
  
  const issues = [];
  
  // Vérifier si le webhook est configuré
  try {
    const webhooks = await stripe.webhookEndpoints.list();
    const ourWebhook = webhooks.data.find(w => 
      w.url.includes('home.regispailler.fr/api/webhooks/stripe')
    );
    
    if (!ourWebhook) {
      issues.push('❌ Webhook Stripe non configuré vers https://home.regispailler.fr/api/webhooks/stripe');
    } else if (ourWebhook.status !== 'enabled') {
      issues.push('❌ Webhook Stripe désactivé');
    }
  } catch (error) {
    issues.push('❌ Impossible de vérifier la configuration du webhook');
  }
  
  // Vérifier les métadonnées des paiements
  try {
    const paymentIntents = await stripe.paymentIntents.list({ limit: 5 });
    const missingMetadata = paymentIntents.data.filter(pi => 
      !pi.metadata?.customer_email || !pi.metadata?.items_ids
    );
    
    if (missingMetadata.length > 0) {
      issues.push('❌ Certains paiements n\'ont pas les métadonnées requises (customer_email, items_ids)');
    }
  } catch (error) {
    issues.push('❌ Impossible de vérifier les métadonnées des paiements');
  }
  
  // Vérifier les permissions Supabase
  if (accessError) {
    issues.push('❌ Problème de permissions sur la table module_access');
  }
  
  if (issues.length === 0) {
    console.log('✅ Aucun problème évident détecté');
    console.log('💡 Le problème pourrait être:');
    console.log('   - Le webhook ne reçoit pas les événements');
    console.log('   - Erreur dans le code du webhook');
    console.log('   - Problème de réseau entre Stripe et votre serveur');
  } else {
    console.log('❌ Problèmes détectés:');
    issues.forEach(issue => console.log(issue));
  }
  
  // 7. Recommandations
  console.log('\n📋 Recommandations:');
  console.log('1. Configurer le webhook Stripe vers: https://home.regispailler.fr/api/webhooks/stripe');
  console.log('2. Vérifier que les métadonnées des paiements contiennent customer_email et items_ids');
  console.log('3. Vérifier les logs du serveur Next.js lors d\'un paiement');
  console.log('4. Tester avec un paiement en mode test');
  console.log('5. Vérifier les permissions RLS sur la table module_access');
  
  console.log('\n🔍 Diagnostic terminé');
}

debugStripeWebhook().catch(console.error); 