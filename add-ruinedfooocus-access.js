require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addRuinedfooocusAccess() {
  try {
    console.log('🔍 Ajout de l\'accès ruinedfooocus pour regispailler@gmail.com...');
    
    // 1. Récupérer l'utilisateur depuis profiles
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'regispailler@gmail.com')
      .single();
    
    if (userError || !userData) {
      console.error('❌ Utilisateur regispailler@gmail.com non trouvé dans profiles');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', userData.id);
    
    // 2. Vérifier si l'accès existe déjà
    const { data: existingAccess, error: checkError } = await supabase
      .from('module_access')
      .select('id')
      .eq('user_id', userData.id)
      .eq('module_id', 13) // ID du module ruinedfooocus
      .single();
    
    if (existingAccess) {
      console.log('✅ Accès ruinedfooocus déjà existant');
      return;
    }
    
    // 3. Ajouter l'accès au module ruinedfooocus
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .insert({
        user_id: userData.id,
        module_id: 13, // ID du module ruinedfooocus
        access_type: 'purchase',
        metadata: {
          session_id: 'manual-fix-ruinedfooocus',
          purchased_at: new Date().toISOString(),
          reason: 'Correction manuelle - webhook Stripe échoué'
        }
      })
      .select()
      .single();
    
    if (accessError) {
      console.error('❌ Erreur création accès:', accessError);
      return;
    }
    
    console.log('✅ Accès ruinedfooocus créé avec succès:', accessData.id);
    console.log('📋 Détails de l\'accès:', accessData);
    
    // 4. Vérifier que l'accès a bien été créé
    const { data: verifyAccess, error: verifyError } = await supabase
      .from('module_access')
      .select('id, created_at, access_type, module_id')
      .eq('user_id', userData.id)
      .eq('module_id', 13)
      .single();
    
    if (verifyAccess) {
      console.log('✅ Vérification réussie - Accès ruinedfooocus disponible');
    } else {
      console.log('❌ Erreur lors de la vérification');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout d\'accès:', error);
  }
}

addRuinedfooocusAccess(); 