const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDuplicates() {
  try {
    console.log('🔍 Vérification des modules en double...\n');

    const { data: modules, error } = await supabase
      .from('modules')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    // Compter les occurrences de chaque titre
    const titleCounts = {};
    modules.forEach(module => {
      const title = module.title.trim();
      titleCounts[title] = (titleCounts[title] || 0) + 1;
    });

    // Afficher les doublons
    const duplicates = Object.entries(titleCounts)
      .filter(([title, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);

    if (duplicates.length === 0) {
      console.log('✅ Aucun doublon trouvé !');
      return;
    }

    console.log(`⚠️ ${duplicates.length} titre(s) avec des doublons :\n`);
    
    duplicates.forEach(([title, count]) => {
      console.log(`   "${title}" : ${count} occurrences`);
    });

    // Afficher les détails pour Stable diffusion
    const stableDiffusionModules = modules.filter(m => m.title === 'Stable diffusion');
    if (stableDiffusionModules.length > 1) {
      console.log('\n📋 Détails des modules "Stable diffusion" :');
      stableDiffusionModules.forEach((module, index) => {
        console.log(`   ${index + 1}. ID: ${module.id}, Prix: ${module.price}, Créé: ${module.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkDuplicates(); 