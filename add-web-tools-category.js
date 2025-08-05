const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addWebToolsCategory() {
  try {
    console.log('🚀 Début de l\'ajout de la catégorie Web Tools...\n');

    // 1. Vérifier les modules gratuits existants
    console.log('📋 Modules gratuits actuels:');
    const { data: freeModules, error: freeError } = await supabase
      .from('modules')
      .select('id, title, category, price, created_at')
      .or('price.eq.0,price.eq."0"')
      .order('title');

    if (freeError) {
      console.error('❌ Erreur lors de la récupération des modules gratuits:', freeError);
      return;
    }

    console.table(freeModules);
    console.log(`\n📊 Nombre de modules gratuits trouvés: ${freeModules.length}\n`);

    // 2. Mettre à jour les modules gratuits pour leur attribuer la catégorie "Web Tools"
    console.log('🔄 Mise à jour des modules gratuits...');
    
    const modulesToUpdate = freeModules.filter(module => module.category !== 'Web Tools');
    
    if (modulesToUpdate.length === 0) {
      console.log('✅ Tous les modules gratuits ont déjà la catégorie "Web Tools"');
    } else {
      console.log(`📝 Modules à mettre à jour: ${modulesToUpdate.length}`);
      
      for (const module of modulesToUpdate) {
        console.log(`  - ${module.title} (${module.category} → Web Tools)`);
        
        const { error: updateError } = await supabase
          .from('modules')
          .update({ category: 'Web Tools' })
          .eq('id', module.id);

        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour de ${module.title}:`, updateError);
        } else {
          console.log(`  ✅ ${module.title} mis à jour avec succès`);
        }
      }
    }

    // 3. Vérifier le résultat final
    console.log('\n📋 Modules avec la catégorie Web Tools:');
    const { data: webToolsModules, error: webToolsError } = await supabase
      .from('modules')
      .select('id, title, category, price, created_at')
      .eq('category', 'Web Tools')
      .order('title');

    if (webToolsError) {
      console.error('❌ Erreur lors de la vérification:', webToolsError);
      return;
    }

    console.table(webToolsModules);
    console.log(`\n📊 Nombre de modules Web Tools: ${webToolsModules.length}`);

    // 4. Afficher un résumé des catégories
    console.log('\n📊 Résumé des catégories:');
    const { data: allModules, error: allError } = await supabase
      .from('modules')
      .select('category, price');

    if (allError) {
      console.error('❌ Erreur lors de la récupération de tous les modules:', allError);
      return;
    }

    const categorySummary = {};
    allModules.forEach(module => {
      if (!categorySummary[module.category]) {
        categorySummary[module.category] = { total: 0, free: 0 };
      }
      categorySummary[module.category].total++;
      if (module.price === '0' || module.price === 0) {
        categorySummary[module.category].free++;
      }
    });

    console.table(Object.entries(categorySummary).map(([category, stats]) => ({
      Catégorie: category,
      'Total modules': stats.total,
      'Modules gratuits': stats.free
    })));

    console.log('\n✅ Opération terminée avec succès !');
    console.log('💡 N\'oubliez pas que la catégorie "Web Tools" a été ajoutée au code TypeScript dans src/app/page.tsx');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
addWebToolsCategory(); 