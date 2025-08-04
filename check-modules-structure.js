// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkModulesStructure() {
  console.log('🔍 Vérification de la structure des modules');
  
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
    
    // 2. Vérifier les accès modules avec leurs modules correspondants
    console.log('\n2️⃣ Accès modules avec détails...');
    const { data: accessWithModules, error: accessError } = await supabase
      .from('module_access')
      .select(`
        id,
        user_id,
        module_id,
        access_type,
        created_at,
        modules!inner(
          id,
          title,
          price
        )
      `)
      .limit(5);
    
    if (accessError) {
      console.error('❌ Erreur récupération accès avec modules:', accessError);
      return;
    }
    
    console.log('📊 Accès avec modules trouvés:', accessWithModules?.length || 0);
    accessWithModules?.forEach((access, index) => {
      console.log(`  ${index + 1}. Module: ${access.modules?.title} (ID: ${access.module_id})`);
    });
    
    // 3. Vérifier spécifiquement Stable Diffusion
    console.log('\n3️⃣ Vérification Stable Diffusion...');
    const stableDiffusionModule = allModules?.find(m => m.title === 'Stable diffusion');
    if (stableDiffusionModule) {
      console.log('✅ Module Stable Diffusion trouvé:', {
        id: stableDiffusionModule.id,
        title: stableDiffusionModule.title,
        price: stableDiffusionModule.price
      });
      
      // Vérifier s'il y a des accès pour ce module
      const { data: stableAccess, error: stableAccessError } = await supabase
        .from('module_access')
        .select('*')
        .eq('module_id', stableDiffusionModule.id);
      
      if (stableAccessError) {
        console.error('❌ Erreur vérification accès Stable Diffusion:', stableAccessError);
      } else {
        console.log('📊 Accès pour Stable Diffusion:', stableAccess?.length || 0);
        stableAccess?.forEach((access, index) => {
          console.log(`  ${index + 1}. User: ${access.user_id}, Type: ${access.access_type}`);
        });
      }
    } else {
      console.log('❌ Module Stable Diffusion non trouvé');
    }
    
    console.log('\n🎉 Vérification terminée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
checkModulesStructure(); 