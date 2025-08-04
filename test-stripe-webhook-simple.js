require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec la clé anonyme
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Présent' : 'Manquant');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Présent' : 'Manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStripeWebhookSimple() {
  console.log('🔍 Test simplifié du webhook Stripe...');
  
  // 1. Vérifier les variables d'environnement Stripe
  console.log('\n📋 Variables d\'environnement Stripe:');
  console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Présent' : 'Manquant');
  console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Présent' : 'Manquant');
  console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || 'console');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Présent' : 'Manquant');
  console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'Non défini');
  
  // 2. Vérifier les modules dans la base de données
  console.log('\n📋 Modules dans la base de données:');
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('id, title, price')
    .order('id');
    
  if (modulesError) {
    console.error('❌ Erreur récupération modules:', modulesError);
  } else {
    console.log('✅ Modules trouvés:', modules.length);
    modules.forEach(module => {
      console.log(`  - ID: ${module.id}, Titre: ${module.title}, Prix: ${module.price}`);
    });
  }
  
  // 3. Vérifier les accès modules existants (lecture seule)
  console.log('\n📋 Accès modules existants:');
  const { data: moduleAccess, error: accessError } = await supabase
    .from('module_access')
    .select('id, user_id, module_id, access_type, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (accessError) {
    console.error('❌ Erreur récupération accès modules:', accessError);
  } else {
    console.log('✅ Accès modules trouvés:', moduleAccess.length);
    moduleAccess.forEach(access => {
      console.log(`  - ID: ${access.id}, User: ${access.user_id}, Module: ${access.module_id}, Type: ${access.access_type}`);
    });
  }
  
  // 4. Vérifier les utilisateurs avec des abonnements Stripe
  console.log('\n📋 Utilisateurs avec abonnements Stripe:');
  const { data: subscriptions, error: subsError } = await supabase
    .from('user_subscriptions')
    .select('id, user_id, module_name, subscription_id, status, end_date')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (subsError) {
    console.error('❌ Erreur récupération abonnements:', subsError);
  } else {
    console.log('✅ Abonnements trouvés:', subscriptions.length);
    subscriptions.forEach(sub => {
      console.log(`  - ID: ${sub.id}, User: ${sub.user_id}, Module: ${sub.module_name}, Status: ${sub.status}`);
    });
  }
  
  // 5. Tester l'envoi d'email
  console.log('\n📧 Test d\'envoi d\'email...');
  
  try {
    const { EmailService } = require('./src/utils/emailService');
    const emailService = EmailService.getInstance();
    
    const testItems = [{ id: '1', title: 'Stable Diffusion' }];
    const emailResult = await emailService.sendPaymentConfirmation(
      'test@example.com',
      1500, // 15€ en centimes
      testItems,
      'test_session_123'
    );
    
    console.log('📧 Résultat envoi email:', emailResult ? '✅ Succès' : '❌ Échec');
  } catch (error) {
    console.error('❌ Erreur test email:', error);
  }
  
  // 6. Analyser le problème potentiel
  console.log('\n🔍 Analyse du problème:');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('❌ STRIPE_SECRET_KEY manquant - Le webhook ne peut pas fonctionner');
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('❌ STRIPE_WEBHOOK_SECRET manquant - Le webhook ne peut pas valider les signatures');
  }
  
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY manquant - Les emails seront envoyés en mode console uniquement');
  }
  
  // 7. Vérifier les logs du webhook
  console.log('\n📋 Suggestions pour diagnostiquer le webhook:');
  console.log('1. Vérifiez les logs du serveur Next.js lors d\'un paiement');
  console.log('2. Vérifiez que le webhook Stripe pointe vers: https://home.regispailler.fr/api/webhooks/stripe');
  console.log('3. Vérifiez que les métadonnées du paiement contiennent customer_email et items_ids');
  console.log('4. Vérifiez que l\'utilisateur existe dans Supabase auth.users');
  
  console.log('\n🔍 Diagnostic terminé');
}

testStripeWebhookSimple().catch(console.error); 