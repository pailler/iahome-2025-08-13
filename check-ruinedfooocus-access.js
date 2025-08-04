require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRuinedfooocusAccess() {
  try {
    console.log('🔍 Vérification de l\'accès ruinedfooocus pour regispailler@gmail.com...');
    
    // 1. Vérifier si l'utilisateur existe
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'regispailler@gmail.com')
      .single();
    
    if (userError || !userData) {
      console.error('❌ Utilisateur regispailler@gmail.com non trouvé dans profiles');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', userData);
    
    // 2. Vérifier les accès modules (sans jointure)
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .select('id, created_at, access_type, expires_at, metadata, module_id')
      .eq('user_id', userData.id);
    
    if (accessError) {
      console.error('❌ Erreur récupération accès:', accessError);
      return;
    }
    
    console.log('📋 Accès modules actuels:');
    if (accessData && accessData.length > 0) {
      for (const access of accessData) {
        // Récupérer les détails du module pour chaque accès
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('id, title, price')
          .eq('id', access.module_id)
          .single();
        
        if (moduleData) {
          console.log(`  - ${moduleData.title} (ID: ${access.module_id}, Type: ${access.access_type})`);
        } else {
          console.log(`  - Module ID ${access.module_id} (Type: ${access.access_type}) - Module supprimé`);
        }
      }
    } else {
      console.log('  Aucun accès module trouvé');
    }
    
    // 3. Vérifier spécifiquement l'accès à ruinedfooocus (ID: 13)
    const ruinedfooocusAccess = accessData?.find(access => access.module_id === 13);
    
    if (ruinedfooocusAccess) {
      console.log('✅ Accès ruinedfooocus trouvé:', ruinedfooocusAccess);
    } else {
      console.log('❌ Accès ruinedfooocus manquant');
      
      // 4. Vérifier les abonnements Stripe
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userData.id);
      
      if (subscriptionData && subscriptionData.length > 0) {
        console.log('📋 Abonnements Stripe:');
        subscriptionData.forEach(sub => {
          console.log(`  - ${sub.module_name} (Status: ${sub.status}, End: ${sub.end_date})`);
        });
      } else {
        console.log('  Aucun abonnement Stripe trouvé');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkRuinedfooocusAccess(); 