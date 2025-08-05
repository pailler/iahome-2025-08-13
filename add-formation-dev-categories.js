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

async function addFormationDevCategories() {
  try {
    console.log('🚀 Début de l\'ajout des catégories IA FORMATION et IA DEVELOPPEMENT...\n');

    // 1. Vérifier tous les modules existants
    console.log('📋 Modules existants:');
    const { data: allModules, error: allError } = await supabase
      .from('modules')
      .select('id, title, category, price, created_at')
      .order('title');

    if (allError) {
      console.error('❌ Erreur lors de la récupération des modules:', allError);
      return;
    }

    console.table(allModules);
    console.log(`\n📊 Nombre total de modules: ${allModules.length}\n`);

    // 2. Définir les modules à attribuer à IA FORMATION
    const formationModules = allModules.filter(module => 
      module.title.toLowerCase().includes('chatgpt') ||
      module.title.toLowerCase().includes('claude') ||
      module.title.toLowerCase().includes('bard') ||
      module.title.toLowerCase().includes('assistant') ||
      module.title.toLowerCase().includes('formation') ||
      module.title.toLowerCase().includes('apprendre') ||
      module.title.toLowerCase().includes('tutoriel')
    );

    // 3. Définir les modules à attribuer à IA DEVELOPPEMENT
    const devModules = allModules.filter(module => 
      module.title.toLowerCase().includes('code') ||
      module.title.toLowerCase().includes('programmation') ||
      module.title.toLowerCase().includes('développement') ||
      module.title.toLowerCase().includes('api') ||
      module.title.toLowerCase().includes('github') ||
      module.title.toLowerCase().includes('git') ||
      module.title.toLowerCase().includes('terminal') ||
      module.title.toLowerCase().includes('script')
    );

    // 4. Mettre à jour les modules pour IA FORMATION
    console.log('🔄 Mise à jour des modules pour IA FORMATION...');
    
    if (formationModules.length === 0) {
      console.log('ℹ️ Aucun module trouvé pour la catégorie IA FORMATION');
    } else {
      console.log(`📝 Modules à attribuer à IA FORMATION: ${formationModules.length}`);
      
      for (const module of formationModules) {
        if (module.category !== 'IA FORMATION') {
          console.log(`  - ${module.title} (${module.category} → IA FORMATION)`);
          
          const { error: updateError } = await supabase
            .from('modules')
            .update({ category: 'IA FORMATION' })
            .eq('id', module.id);

          if (updateError) {
            console.error(`❌ Erreur lors de la mise à jour de ${module.title}:`, updateError);
          } else {
            console.log(`  ✅ ${module.title} mis à jour avec succès`);
          }
        } else {
          console.log(`  - ${module.title} (déjà en IA FORMATION)`);
        }
      }
    }

    // 5. Mettre à jour les modules pour IA DEVELOPPEMENT
    console.log('\n🔄 Mise à jour des modules pour IA DEVELOPPEMENT...');
    
    if (devModules.length === 0) {
      console.log('ℹ️ Aucun module trouvé pour la catégorie IA DEVELOPPEMENT');
    } else {
      console.log(`📝 Modules à attribuer à IA DEVELOPPEMENT: ${devModules.length}`);
      
      for (const module of devModules) {
        if (module.category !== 'IA DEVELOPPEMENT') {
          console.log(`  - ${module.title} (${module.category} → IA DEVELOPPEMENT)`);
          
          const { error: updateError } = await supabase
            .from('modules')
            .update({ category: 'IA DEVELOPPEMENT' })
            .eq('id', module.id);

          if (updateError) {
            console.error(`❌ Erreur lors de la mise à jour de ${module.title}:`, updateError);
          } else {
            console.log(`  ✅ ${module.title} mis à jour avec succès`);
          }
        } else {
          console.log(`  - ${module.title} (déjà en IA DEVELOPPEMENT)`);
        }
      }
    }

    // 6. Vérifier le résultat final
    console.log('\n📋 Modules avec la catégorie IA FORMATION:');
    const { data: formationModulesFinal, error: formationError } = await supabase
      .from('modules')
      .select('id, title, category, price, created_at')
      .eq('category', 'IA FORMATION')
      .order('title');

    if (formationError) {
      console.error('❌ Erreur lors de la vérification IA FORMATION:', formationError);
    } else {
      console.table(formationModulesFinal);
      console.log(`\n📊 Nombre de modules IA FORMATION: ${formationModulesFinal.length}`);
    }

    console.log('\n📋 Modules avec la catégorie IA DEVELOPPEMENT:');
    const { data: devModulesFinal, error: devError } = await supabase
      .from('modules')
      .select('id, title, category, price, created_at')
      .eq('category', 'IA DEVELOPPEMENT')
      .order('title');

    if (devError) {
      console.error('❌ Erreur lors de la vérification IA DEVELOPPEMENT:', devError);
    } else {
      console.table(devModulesFinal);
      console.log(`\n📊 Nombre de modules IA DEVELOPPEMENT: ${devModulesFinal.length}`);
    }

    // 7. Afficher un résumé des catégories
    console.log('\n📊 Résumé des catégories:');
    const { data: allModulesFinal, error: allFinalError } = await supabase
      .from('modules')
      .select('category, price');

    if (allFinalError) {
      console.error('❌ Erreur lors de la récupération de tous les modules:', allFinalError);
      return;
    }

    const categorySummary = {};
    allModulesFinal.forEach(module => {
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
    console.log('💡 Les catégories "IA FORMATION" et "IA DEVELOPPEMENT" ont été ajoutées au code TypeScript dans src/app/page.tsx');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
addFormationDevCategories(); 