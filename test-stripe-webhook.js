require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Utiliser la clé service pour les opérations admin

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Présent' : 'Manquant');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Présent' : 'Manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStripeWebhook() {
  console.log('🔍 Test du webhook Stripe...');
  
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
  
  // 3. Vérifier les accès modules existants
  console.log('\n📋 Accès modules existants:');
  const { data: moduleAccess, error: accessError } = await supabase
    .from('module_access')
    .select(`
      id,
      user_id,
      module_id,
      access_type,
      created_at,
      modules!inner(title)
    `)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (accessError) {
    console.error('❌ Erreur récupération accès modules:', accessError);
  } else {
    console.log('✅ Accès modules trouvés:', moduleAccess.length);
    moduleAccess.forEach(access => {
      console.log(`  - ID: ${access.id}, User: ${access.user_id}, Module: ${access.modules.title}, Type: ${access.access_type}`);
    });
  }
  
  // 4. Vérifier les utilisateurs avec des abonnements Stripe
  console.log('\n📋 Utilisateurs avec abonnements Stripe:');
  const { data: subscriptions, error: subsError } = await supabase
    .from('user_subscriptions')
    .select(`
      id,
      user_id,
      module_name,
      subscription_id,
      status,
      end_date,
      profiles!inner(email)
    `)
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (subsError) {
    console.error('❌ Erreur récupération abonnements:', subsError);
  } else {
    console.log('✅ Abonnements trouvés:', subscriptions.length);
    subscriptions.forEach(sub => {
      console.log(`  - ID: ${sub.id}, User: ${sub.profiles.email}, Module: ${sub.module_name}, Status: ${sub.status}`);
    });
  }
  
  // 5. Simuler un événement de paiement réussi
  console.log('\n🧪 Simulation d\'un événement de paiement réussi...');
  
  const testEmail = 'regispailler@gmail.com';
  const testModuleId = '1'; // ID du module Stable Diffusion
  
  // Vérifier si l'utilisateur existe
  const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(testEmail);
  
  if (userError || !userData?.user) {
    console.error('❌ Utilisateur non trouvé:', testEmail);
    return;
  }
  
  console.log('✅ Utilisateur trouvé:', userData.user.id);
  
  // Vérifier si le module existe
  const { data: moduleData, error: moduleError } = await supabase
    .from('modules')
    .select('id, title')
    .eq('id', testModuleId)
    .single();
    
  if (moduleError || !moduleData) {
    console.error('❌ Module non trouvé:', testModuleId);
    return;
  }
  
  console.log('✅ Module trouvé:', moduleData.title);
  
  // Vérifier si l'accès existe déjà
  const { data: existingAccess, error: checkError } = await supabase
    .from('module_access')
    .select('id')
    .eq('user_id', userData.user.id)
    .eq('module_id', parseInt(testModuleId))
    .single();
    
  if (existingAccess) {
    console.log('✅ Accès déjà existant pour:', testEmail, testModuleId);
  } else {
    console.log('❌ Aucun accès trouvé pour:', testEmail, testModuleId);
  }
  
  // 6. Tester l'envoi d'email
  console.log('\n📧 Test d\'envoi d\'email...');
  
  const { EmailService } = require('./src/utils/emailService');
  const emailService = EmailService.getInstance();
  
  const testItems = [{ id: testModuleId, title: moduleData.title }];
  const emailResult = await emailService.sendPaymentConfirmation(
    testEmail,
    1500, // 15€ en centimes
    testItems,
    'test_session_123'
  );
  
  console.log('📧 Résultat envoi email:', emailResult ? '✅ Succès' : '❌ Échec');
  
  console.log('\n🔍 Diagnostic terminé');
}

testStripeWebhook().catch(console.error); 