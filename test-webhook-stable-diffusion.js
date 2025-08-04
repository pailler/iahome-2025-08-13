// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStableDiffusionAccess() {
  console.log('🔍 Test d\'accès pour Stable Diffusion');
  
  try {
    // 1. Vérifier si le module Stable Diffusion existe
    console.log('\n1️⃣ Vérification du module Stable Diffusion...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('title', 'Stable diffusion');
    
    if (modulesError) {
      console.error('❌ Erreur récupération modules:', modulesError);
      return;
    }
    
    console.log('📊 Modules trouvés:', modules?.length || 0);
    modules?.forEach((module, index) => {
      console.log(`  ${index + 1}. ${module.title} (ID: ${module.id}, Prix: ${module.price})`);
    });
    
    // 2. Vérifier les accès modules existants
    console.log('\n2️⃣ Vérification des accès modules...');
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .select('*')
      .limit(10);
    
    if (accessError) {
      console.error('❌ Erreur récupération accès:', accessError);
      return;
    }
    
    console.log('📊 Accès modules trouvés:', accessData?.length || 0);
    accessData?.forEach((access, index) => {
      console.log(`  ${index + 1}. User: ${access.user_id}, Module: ${access.module_id}, Type: ${access.access_type}`);
    });
    
    // 3. Vérifier la structure de la table module_access
    console.log('\n3️⃣ Structure de la table module_access...');
    if (accessData && accessData.length > 0) {
      const sample = accessData[0];
      console.log('Exemple d\'accès:', {
        id: sample.id,
        user_id: sample.user_id,
        module_id: sample.module_id,
        access_type: sample.access_type,
        created_at: sample.created_at,
        metadata: sample.metadata
      });
    }
    
    console.log('\n🎉 Test terminé !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testStableDiffusionAccess(); 