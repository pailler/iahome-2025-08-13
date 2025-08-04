require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec la clé de service
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Présent' : 'Manquant');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Présent' : 'Manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingCogstudioAccess() {
  console.log('🔧 Ajout de l\'accès Cogstudio manquant...');
  
  const userEmail = 'regispailler@gmail.com';
  const moduleId = '6'; // Cogstudio
  
  try {
    // 1. Récupérer l'utilisateur
    console.log('\n📋 Récupération de l\'utilisateur...');
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail);
    
    if (userError || !userData?.user) {
      console.error('❌ Utilisateur non trouvé:', userEmail);
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', userData.user.id);
    
    // 2. Vérifier si le module existe
    console.log('\n📋 Vérification du module...');
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, price')
      .eq('id', moduleId)
      .single();
      
    if (moduleError || !moduleData) {
      console.error('❌ Module non trouvé:', moduleId);
      return;
    }
    
    console.log('✅ Module trouvé:', moduleData.title, '(Prix:', moduleData.price + ')');
    
    // 3. Vérifier si l'accès existe déjà
    console.log('\n📋 Vérification de l\'accès existant...');
    const { data: existingAccess, error: checkError } = await supabase
      .from('module_access')
      .select('id, created_at')
      .eq('user_id', userData.user.id)
      .eq('module_id', parseInt(moduleId))
      .single();
      
    if (existingAccess) {
      console.log('✅ Accès déjà existant créé le:', new Date(existingAccess.created_at).toLocaleString());
      return;
    }
    
    console.log('❌ Aucun accès trouvé - ajout en cours...');
    
    // 4. Créer l'accès module
    console.log('\n📝 Création de l\'accès module...');
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .insert({
        user_id: userData.user.id,
        module_id: parseInt(moduleId),
        access_type: 'purchase',
        metadata: {
          session_id: 'manual_fix_' + Date.now(),
          purchased_at: new Date().toISOString(),
          reason: 'Correction manuelle - accès manquant après paiement'
        }
      })
      .select()
      .single();
      
    if (accessError) {
      console.error('❌ Erreur création accès module:', accessError);
    } else {
      console.log('✅ Accès module créé:', accessData.id);
      console.log('📅 Créé le:', new Date(accessData.created_at).toLocaleString());
    }
    
    // 5. Vérifier que l'accès a été créé
    console.log('\n🔍 Vérification finale...');
    const { data: verifyAccess, error: verifyError } = await supabase
      .from('module_access')
      .select('id, created_at')
      .eq('user_id', userData.user.id)
      .eq('module_id', parseInt(moduleId))
      .single();
      
    if (verifyAccess) {
      console.log('✅ Accès vérifié:', verifyAccess.id);
      console.log('✅ L\'utilisateur peut maintenant accéder à Cogstudio');
    } else {
      console.log('❌ Erreur lors de la vérification');
    }
    
    // 6. Vérifier tous les accès de l'utilisateur
    console.log('\n📋 Tous les accès de l\'utilisateur:');
    const { data: allAccess, error: allAccessError } = await supabase
      .from('module_access')
      .select('id, module_id, access_type, created_at')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });
      
    if (!allAccessError && allAccess) {
      console.log('✅ Accès totaux:', allAccess.length);
      allAccess.forEach((access, index) => {
        console.log(`  ${index + 1}. Module ID: ${access.module_id}, Type: ${access.access_type}, Créé: ${new Date(access.created_at).toLocaleString()}`);
      });
    }
    
    console.log('\n🔧 Correction terminée');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout:', error);
  }
}

addMissingCogstudioAccess().catch(console.error); 