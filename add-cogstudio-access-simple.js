require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec la clé anonyme
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCogstudioAccessSimple() {
  console.log('🔧 Ajout de l\'accès Cogstudio (méthode simplifiée)...');
  
  const userEmail = 'regispailler@gmail.com';
  const moduleId = '6'; // Cogstudio
  
  try {
    // 1. Récupérer l'utilisateur depuis profiles
    console.log('\n📋 Récupération de l\'utilisateur...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .single();
      
    if (profilesError || !profiles) {
      console.error('❌ Utilisateur non trouvé:', profilesError);
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', profiles.id);
    
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
      .eq('user_id', profiles.id)
      .eq('module_id', parseInt(moduleId))
      .single();
      
    if (existingAccess) {
      console.log('✅ Accès déjà existant créé le:', new Date(existingAccess.created_at).toLocaleString());
      return;
    }
    
    console.log('❌ Aucun accès trouvé');
    
    // 4. Tenter de créer l'accès (peut échouer sans la clé de service)
    console.log('\n📝 Tentative de création de l\'accès module...');
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .insert({
        user_id: profiles.id,
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
      console.log('💡 Cette erreur est normale sans la clé de service Supabase');
      console.log('💡 L\'accès doit être ajouté manuellement dans la base de données');
    } else {
      console.log('✅ Accès module créé:', accessData.id);
      console.log('📅 Créé le:', new Date(accessData.created_at).toLocaleString());
    }
    
    // 5. Vérifier tous les accès de l'utilisateur
    console.log('\n📋 Tous les accès de l\'utilisateur:');
    const { data: allAccess, error: allAccessError } = await supabase
      .from('module_access')
      .select('id, module_id, access_type, created_at')
      .eq('user_id', profiles.id)
      .order('created_at', { ascending: false });
      
    if (!allAccessError && allAccess) {
      console.log('✅ Accès totaux:', allAccess.length);
      allAccess.forEach((access, index) => {
        console.log(`  ${index + 1}. Module ID: ${access.module_id}, Type: ${access.access_type}, Créé: ${new Date(access.created_at).toLocaleString()}`);
      });
    }
    
    // 6. Instructions pour l'ajout manuel
    console.log('\n📋 Instructions pour l\'ajout manuel:');
    console.log('1. Connectez-vous à votre dashboard Supabase');
    console.log('2. Allez dans la table "module_access"');
    console.log('3. Ajoutez une nouvelle ligne avec:');
    console.log(`   - user_id: ${profiles.id}`);
    console.log(`   - module_id: ${moduleId}`);
    console.log('   - access_type: purchase');
    console.log('   - metadata: {"session_id": "manual_fix", "reason": "Correction manuelle"}');
    
    console.log('\n🔧 Vérification terminée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

addCogstudioAccessSimple().catch(console.error); 