require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserStableDiffusion() {
  console.log('🔍 Vérification de l\'accès Stable Diffusion pour regispailler@gmail.com');
  
  try {
    // 1. Vérifier si l'utilisateur existe
    console.log('\n1️⃣ Vérification de l\'utilisateur...');
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .eq('email', 'regispailler@gmail.com')
      .single();

    if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      return;
    }

    if (!userData) {
      console.log('❌ Utilisateur regispailler@gmail.com non trouvé');
      return;
    }

    console.log('✅ Utilisateur trouvé:', {
      id: userData.id,
      email: userData.email,
      created_at: userData.created_at
    });

    // 2. Vérifier les accès aux modules
    console.log('\n2️⃣ Vérification des accès aux modules...');
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', userData.id);

    if (accessError) {
      console.error('❌ Erreur récupération accès:', accessError);
      return;
    }

    console.log('📊 Accès trouvés:', accessData?.length || 0);
    
    if (accessData && accessData.length > 0) {
      for (const access of accessData) {
        console.log('  - Module ID:', access.module_id, 'Type:', access.access_type, 'Créé:', access.created_at);
      }
    }

    // 3. Vérifier spécifiquement Stable Diffusion
    console.log('\n3️⃣ Vérification spécifique Stable Diffusion...');
    const { data: stableDiffusion, error: sdError } = await supabase
      .from('modules')
      .select('id, title, price')
      .eq('title', 'Stable diffusion')
      .single();

    if (sdError) {
      console.error('❌ Erreur récupération Stable Diffusion:', sdError);
      return;
    }

    console.log('✅ Stable Diffusion trouvé:', stableDiffusion);

    // 4. Vérifier si l'utilisateur a accès à Stable Diffusion
    const hasAccess = accessData?.some(access => access.module_id === stableDiffusion.id);
    console.log('\n4️⃣ Résultat:');
    console.log(hasAccess ? '✅ L\'utilisateur a accès à Stable Diffusion' : '❌ L\'utilisateur n\'a PAS accès à Stable Diffusion');

    // 5. Vérifier les abonnements Stripe
    console.log('\n5️⃣ Vérification des abonnements Stripe...');
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userData.id);

    if (subError) {
      console.error('❌ Erreur récupération abonnements:', subError);
      return;
    }

    console.log('📊 Abonnements Stripe trouvés:', subscriptions?.length || 0);
    
    if (subscriptions && subscriptions.length > 0) {
      for (const sub of subscriptions) {
        console.log('  - Subscription ID:', sub.stripe_subscription_id, 'Status:', sub.status, 'Créé:', sub.created_at);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkUserStableDiffusion(); 