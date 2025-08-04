const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkModules() {
  console.log('🔍 Vérification des modules dans la base de données...');
  
  try {
    // Récupérer tous les modules
    const { data: modules, error } = await supabase
      .from('modules')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des modules:', error);
      return;
    }
    
    console.log(`✅ ${modules.length} modules trouvés dans la base de données:`);
    console.log('');
    
    modules.forEach((module, index) => {
      console.log(`${index + 1}. ID: ${module.id} | Titre: "${module.title}" | Prix: ${module.price}€ | Catégorie: ${module.category}`);
    });
    
    // Chercher spécifiquement Metube
    const metubeModule = modules.find(m => m.title.toLowerCase().includes('metube'));
    if (metubeModule) {
      console.log('');
      console.log('🎯 Module Metube trouvé:');
      console.log(`   ID: ${metubeModule.id}`);
      console.log(`   Titre: "${metubeModule.title}"`);
      console.log(`   Prix: ${metubeModule.price}€`);
      console.log(`   Catégorie: ${metubeModule.category}`);
      console.log(`   URL de la page: https://home.regispailler.fr/card/${metubeModule.id}`);
    } else {
      console.log('');
      console.log('❌ Module Metube NON trouvé dans la base de données');
      console.log('💡 Vous devez créer le module Metube dans la base de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkModules(); 