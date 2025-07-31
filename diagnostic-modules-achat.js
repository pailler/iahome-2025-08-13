// Script de diagnostic pour les modules achetés
// Usage: node diagnostic-modules-achat.js

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Diagnostic des modules achetés');
console.log('==================================');

// Vérifier la configuration Supabase
console.log('\n📋 Configuration Supabase :');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configuré' : '❌ Manquant');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configuré' : '❌ Manquant');

// Test de connexion Supabase
async function testSupabaseConnection() {
  console.log('\n🗄️ Test de connexion Supabase :');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variables Supabase manquantes');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Client Supabase initialisé');
    
    // Test de connexion
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase réussie');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test Supabase:', error.message);
    return false;
  }
}

// Vérifier les tables nécessaires
async function checkDatabaseTables() {
  console.log('\n📊 Vérification des tables :');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Vérifier la table profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Table profiles:', profilesError.message);
    } else {
      console.log('✅ Table profiles: OK');
    }
    
    // Vérifier la table module_access
    const { data: moduleAccess, error: moduleAccessError } = await supabase
      .from('module_access')
      .select('*')
      .limit(1);
    
    if (moduleAccessError) {
      console.log('❌ Table module_access:', moduleAccessError.message);
    } else {
      console.log('✅ Table module_access: OK');
    }
    
    // Vérifier la table cartes (modules)
    const { data: cartes, error: cartesError } = await supabase
      .from('cartes')
      .select('*')
      .limit(1);
    
    if (cartesError) {
      console.log('❌ Table cartes:', cartesError.message);
    } else {
      console.log('✅ Table cartes: OK');
    }
    
    return !profilesError && !moduleAccessError && !cartesError;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des tables:', error.message);
    return false;
  }
}

// Vérifier les accès existants pour formateur_tic
async function checkUserAccess() {
  console.log('\n👤 Vérification des accès utilisateur :');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Chercher l'utilisateur formateur_tic
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'formateur_tic@hotmail.com')
      .single();
    
    if (userError) {
      console.log('❌ Utilisateur non trouvé:', userError.message);
      return false;
    }
    
    console.log('✅ Utilisateur trouvé:', user.email);
    console.log('   ID:', user.id);
    console.log('   Créé le:', user.created_at);
    
    // Vérifier les accès aux modules
    const { data: access, error: accessError } = await supabase
      .from('module_access')
      .select(`
        *,
        cartes (
          id,
          title,
          description,
          price
        )
      `)
      .eq('user_id', user.id);
    
    if (accessError) {
      console.log('❌ Erreur lors de la récupération des accès:', accessError.message);
      return false;
    }
    
    console.log(`📋 Accès aux modules (${access.length} trouvés) :`);
    
    if (access.length === 0) {
      console.log('   ❌ Aucun accès trouvé');
    } else {
      access.forEach((acc, index) => {
        console.log(`   ${index + 1}. ${acc.cartes?.title || 'Module inconnu'}`);
        console.log(`      ID: ${acc.id}`);
        console.log(`      Créé le: ${acc.created_at}`);
        console.log(`      Expire le: ${acc.expires_at || 'Jamais'}`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des accès:', error.message);
    return false;
  }
}

// Simuler l'ajout d'un accès module
async function simulateModuleAccess() {
  console.log('\n🔄 Simulation d\'ajout d\'accès module :');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'formateur_tic@hotmail.com')
      .single();
    
    if (userError) {
      console.log('❌ Utilisateur non trouvé');
      return false;
    }
    
    // Récupérer un module disponible
    const { data: modules, error: modulesError } = await supabase
      .from('cartes')
      .select('*')
      .limit(1);
    
    if (modulesError || modules.length === 0) {
      console.log('❌ Aucun module disponible');
      return false;
    }
    
    const module = modules[0];
    console.log('📋 Module sélectionné:', module.title);
    
    // Ajouter l'accès
    const { data: newAccess, error: insertError } = await supabase
      .from('module_access')
      .insert({
        user_id: user.id,
        module_id: module.id,
        access_type: 'purchase',
        expires_at: null, // Accès permanent
        metadata: {
          purchase_date: new Date().toISOString(),
          payment_method: 'stripe',
          amount: module.price
        }
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Erreur lors de l\'ajout de l\'accès:', insertError.message);
      return false;
    }
    
    console.log('✅ Accès ajouté avec succès !');
    console.log('   ID accès:', newAccess.id);
    console.log('   Module:', module.title);
    console.log('   Créé le:', newAccess.created_at);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error.message);
    return false;
  }
}

// Vérifier le webhook Stripe
async function checkStripeWebhook() {
  console.log('\n💳 Vérification du webhook Stripe :');
  
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });
    
    // Récupérer les webhooks
    const webhooks = await stripe.webhookEndpoints.list();
    
    const mainWebhook = webhooks.data.find(w => w.url.includes('home.regispailler.fr'));
    
    if (!mainWebhook) {
      console.log('❌ Webhook principal non trouvé');
      return false;
    }
    
    console.log('✅ Webhook trouvé:', mainWebhook.id);
    console.log('   URL:', mainWebhook.url);
    console.log('   Statut:', mainWebhook.status);
    
    // Vérifier les événements récents
    console.log('\n📋 Événements récents :');
    console.log('   Allez sur https://dashboard.stripe.com/webhooks');
    console.log('   Cliquez sur le webhook:', mainWebhook.id);
    console.log('   Vérifiez les tentatives récentes');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification Stripe:', error.message);
    return false;
  }
}

// Fonction principale
async function runDiagnostic() {
  console.log('\n🚀 Démarrage du diagnostic...');
  
  const test1 = await testSupabaseConnection();
  const test2 = await checkDatabaseTables();
  const test3 = await checkUserAccess();
  const test4 = await checkStripeWebhook();
  
  console.log('\n📊 Résumé du diagnostic :');
  console.log('==========================');
  
  if (test1) console.log('✅ Connexion Supabase : OK');
  else console.log('❌ Connexion Supabase : ÉCHEC');
  
  if (test2) console.log('✅ Tables de base : OK');
  else console.log('❌ Tables de base : ÉCHEC');
  
  if (test3) console.log('✅ Accès utilisateur : OK');
  else console.log('❌ Accès utilisateur : ÉCHEC');
  
  if (test4) console.log('✅ Webhook Stripe : OK');
  else console.log('❌ Webhook Stripe : ÉCHEC');
  
  console.log('\n🎯 Prochaines étapes :');
  
  if (test1 && test2 && test3 && test4) {
    console.log('✅ Configuration correcte détectée');
    console.log('🔍 Le problème peut venir de :');
    console.log('   1. Le webhook Stripe ne traite pas correctement l\'événement');
    console.log('   2. L\'insertion en base échoue silencieusement');
    console.log('   3. Les politiques RLS bloquent l\'insertion');
    
    console.log('\n🧪 Voulez-vous simuler l\'ajout d\'un accès ? (décommentez la ligne suivante)');
    console.log('// await simulateModuleAccess();');
  } else {
    console.log('❌ Problèmes de configuration détectés');
    console.log('🔧 Corrigez les problèmes ci-dessus');
  }
  
  console.log('\n📞 Actions recommandées :');
  console.log('1. Vérifiez les logs du serveur lors d\'un paiement');
  console.log('2. Vérifiez le dashboard Stripe > Webhooks');
  console.log('3. Testez l\'ajout manuel d\'un accès');
  console.log('4. Vérifiez les politiques RLS sur module_access');
}

// Exécuter le diagnostic
runDiagnostic().catch(console.error); 