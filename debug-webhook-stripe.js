require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugWebhookStripe() {
  console.log('🔍 Diagnostic du webhook Stripe');
  console.log('================================\n');
  
  try {
    // 1. Vérifier les variables d'environnement
    console.log('📋 Variables d\'environnement :');
    console.log('   STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Configuré' : '❌ Manquant');
    console.log('   STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configuré' : '❌ Manquant');
    console.log('   EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER || '❌ Non configuré');
    console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configuré' : '❌ Manquant');
    console.log('   RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Non configuré');
    console.log('   NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ Non configuré');
    
    // 2. Vérifier les modules disponibles
    console.log('\n📦 Modules disponibles :');
    const { data: modules, error: modulesError } = await supabase
      .from('cartes')
      .select('id, title, price, category')
      .order('id', { ascending: false });
    
    if (modulesError) {
      console.error('❌ Erreur récupération modules:', modulesError);
      return;
    }
    
    modules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.title} (€${module.price}) - ${module.category}`);
    });
    
    // 3. Vérifier les accès actuels
    console.log('\n👤 Accès actuels de formateur_tic@hotmail.com :');
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'formateur_tic@hotmail.com')
      .single();
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      return;
    }
    
    const { data: access, error: accessError } = await supabase
      .from('module_access')
      .select(`
        id,
        created_at,
        access_type,
        cartes!inner(title, price)
      `)
      .eq('user_id', user.id);
    
    if (accessError) {
      console.error('❌ Erreur récupération accès:', accessError);
      return;
    }
    
    if (access.length === 0) {
      console.log('   Aucun accès');
    } else {
      access.forEach(acc => {
        console.log(`   ✅ ${acc.cartes.title} (${acc.access_type}) - ${new Date(acc.created_at).toLocaleString()}`);
      });
    }
    
    // 4. Vérifier les métadonnées Stripe
    console.log('\n🔧 Problèmes potentiels :');
    console.log('   1. Les métadonnées Stripe ne contiennent peut-être pas module_id');
    console.log('   2. Le webhook ne reçoit pas les bonnes données');
    console.log('   3. La signature webhook échoue');
    console.log('   4. Le serveur n\'est pas accessible');
    
    // 5. Suggestions de test
    console.log('\n🧪 Tests à effectuer :');
    console.log('   1. Vérifier les logs du serveur pendant un paiement');
    console.log('   2. Vérifier le dashboard Stripe > Webhooks > Tentatives');
    console.log('   3. Tester avec un module différent');
    console.log('   4. Vérifier que les métadonnées contiennent module_id');
    
    // 6. Créer un test manuel
    console.log('\n📝 Test manuel suggéré :');
    const testModule = modules.find(m => !access.find(a => a.cartes.id === m.id));
    if (testModule) {
      console.log(`   Acheter le module "${testModule.title}" pour tester`);
    } else {
      console.log('   Tous les modules sont déjà achetés');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugWebhookStripe(); 