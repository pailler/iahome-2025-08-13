// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkModuleIds() {
  console.log('🔍 Vérification des IDs des modules');
  
  try {
    // 1. Vérifier tous les modules
    console.log('\n1️⃣ Tous les modules...');
    const { data: allModules, error: allModulesError } = await supabase
      .from('modules')
      .select('*')
      .order('id');
    
    if (allModulesError) {
      console.error('❌ Erreur récupération modules:', allModulesError);
      return;
    }
    
    console.log('📊 Modules trouvés:', allModules?.length || 0);
    allModules?.forEach((module, index) => {
      console.log(`  ${index + 1}. ${module.title} (ID: ${module.id}, Type: ${typeof module.id})`);
    });
    
    // 2. Vérifier la structure de la table module_access
    console.log('\n2️⃣ Structure de module_access...');
    const { data: accessSample, error: accessError } = await supabase
      .from('module_access')
      .select('*')
      .limit(1);
    
    if (accessError) {
      console.error('❌ Erreur récupération module_access:', accessError);
    } else if (accessSample && accessSample.length > 0) {
      const sample = accessSample[0];
      console.log('Exemple d\'accès:', {
        id: sample.id,
        user_id: sample.user_id,
        module_id: sample.module_id,
        access_type: sample.access_type
      });
    } else {
      console.log('Aucun accès dans module_access');
    }
    
    // 3. Vérifier spécifiquement Stable Diffusion
    console.log('\n3️⃣ Vérification Stable Diffusion...');
    const stableDiffusion = allModules?.find(m => m.title === 'Stable diffusion');
    if (stableDiffusion) {
      console.log('✅ Stable Diffusion trouvé:', {
        id: stableDiffusion.id,
        title: stableDiffusion.title,
        price: stableDiffusion.price
      });
      
      // Vérifier s'il y a des accès pour ce module
      const { data: stableAccess, error: stableAccessError } = await supabase
        .from('module_access')
        .select('*')
        .eq('module_id', stableDiffusion.id);
      
      if (stableAccessError) {
        console.error('❌ Erreur vérification accès Stable Diffusion:', stableAccessError);
      } else {
        console.log('📊 Accès pour Stable Diffusion:', stableAccess?.length || 0);
      }
    }
    
    console.log('\n🎉 Vérification terminée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
checkModuleIds(); 