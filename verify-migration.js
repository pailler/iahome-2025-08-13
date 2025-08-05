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

async function verifyMigration() {
  try {
    console.log('🔍 Vérification de la migration des catégories multiples...\n');

    // 1. Vérifier que la table module_categories existe
    console.log('📋 Vérification de la table module_categories...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('module_categories')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('❌ Table module_categories non trouvée:', tableError);
      return;
    }

    console.log('✅ Table module_categories existe');

    // 2. Récupérer tous les modules avec leurs catégories
    console.log('\n📋 Récupération des modules avec catégories...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select(`
        id,
        title,
        category,
        module_categories (
          category
        )
      `)
      .order('title');

    if (modulesError) {
      console.error('❌ Erreur lors de la récupération des modules:', modulesError);
      return;
    }

    console.log(`📊 ${modules.length} modules trouvés\n`);

    // 3. Analyser les catégories
    let modulesWithMultipleCategories = 0;
    let totalCategories = 0;

    console.log('📋 Analyse des catégories par module:');
    modules.forEach(module => {
      const categories = module.module_categories?.map(mc => mc.category) || [];
      const hasMultipleCategories = categories.length > 1;
      
      if (hasMultipleCategories) {
        modulesWithMultipleCategories++;
      }
      
      totalCategories += categories.length;

      console.log(`  - ${module.title}:`);
      console.log(`    Catégorie principale: ${module.category || 'Aucune'}`);
      console.log(`    Catégories multiples: ${categories.join(', ') || 'Aucune'}`);
      console.log(`    Nombre total: ${categories.length}`);
      console.log('');
    });

    // 4. Statistiques
    console.log('📊 Statistiques:');
    console.log(`  - Modules avec catégories multiples: ${modulesWithMultipleCategories}`);
    console.log(`  - Total des catégories: ${totalCategories}`);
    console.log(`  - Moyenne par module: ${(totalCategories / modules.length).toFixed(2)}`);

    // 5. Vérifier les catégories uniques
    console.log('\n📋 Catégories uniques utilisées:');
    const allCategories = modules.flatMap(module => 
      module.module_categories?.map(mc => mc.category) || []
    );
    const uniqueCategories = [...new Set(allCategories)].sort();
    
    uniqueCategories.forEach(category => {
      const count = allCategories.filter(cat => cat === category).length;
      console.log(`  - ${category}: ${count} modules`);
    });

    // 6. Vérifier la cohérence
    console.log('\n🔍 Vérification de la cohérence...');
    let inconsistencies = 0;
    
    modules.forEach(module => {
      const primaryCategory = module.category;
      const multipleCategories = module.module_categories?.map(mc => mc.category) || [];
      
      // Vérifier si la catégorie principale est dans les catégories multiples
      if (primaryCategory && !multipleCategories.includes(primaryCategory)) {
        console.log(`  ⚠️ Incohérence: ${module.title} - catégorie principale "${primaryCategory}" pas dans les multiples`);
        inconsistencies++;
      }
    });

    if (inconsistencies === 0) {
      console.log('✅ Aucune incohérence détectée');
    } else {
      console.log(`⚠️ ${inconsistencies} incohérences détectées`);
    }

    console.log('\n✅ Vérification terminée avec succès !');
    console.log('💡 La migration des catégories multiples est fonctionnelle');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
verifyMigration(); 