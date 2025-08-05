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

async function migrateToMultipleCategories() {
  try {
    console.log('🚀 Migration vers les catégories multiples...\n');

    // 1. Vérifier si la table module_categories existe déjà
    console.log('📋 Vérification de l\'existence de la table module_categories...');
    
    const { data: existingTable, error: checkError } = await supabase
      .from('module_categories')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('❌ Table module_categories non trouvée. Veuillez créer la table manuellement dans Supabase avec le SQL suivant:');
      console.log(`
CREATE TABLE IF NOT EXISTS module_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id BIGINT REFERENCES modules(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, category)
);

CREATE INDEX IF NOT EXISTS idx_module_categories_module_id ON module_categories(module_id);
CREATE INDEX IF NOT EXISTS idx_module_categories_category ON module_categories(category);
      `);
      return;
    }

    if (checkError) {
      console.error('❌ Erreur lors de la vérification de la table:', checkError);
      return;
    }

    console.log('✅ Table module_categories existe déjà');

    // 2. Vérifier s'il y a déjà des données
    const { data: existingData, error: existingError } = await supabase
      .from('module_categories')
      .select('id');

    if (existingError) {
      console.error('❌ Erreur lors de la vérification des données existantes:', existingError);
      return;
    }

    if (existingData && existingData.length > 0) {
      console.log(`ℹ️ ${existingData.length} catégories existent déjà dans la table`);
      console.log('✅ Migration déjà effectuée');
      return;
    }

    // 3. Migrer les données existantes
    console.log('📋 Migration des données existantes...');
    
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, category')
      .not('category', 'is', null)
      .neq('category', '');

    if (modulesError) {
      console.error('❌ Erreur lors de la récupération des modules:', modulesError);
      return;
    }

    console.log(`📊 ${modules.length} modules trouvés avec des catégories`);

    let migratedCount = 0;
    for (const module of modules) {
      const { error: insertError } = await supabase
        .from('module_categories')
        .insert({
          module_id: module.id,
          category: module.category
        });

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`  ⚠️ Catégorie déjà existante pour ${module.title}`);
        } else {
          console.error(`  ❌ Erreur pour ${module.title}:`, insertError);
        }
      } else {
        migratedCount++;
        console.log(`  ✅ ${module.title}: ${module.category}`);
      }
    }

    console.log(`\n📊 Migration terminée: ${migratedCount} catégories migrées`);

    // 4. Vérifier le résultat
    console.log('\n📋 Vérification des données migrées...');
    const { data: categories, error: categoriesError } = await supabase
      .from('module_categories')
      .select(`
        module_id,
        category,
        modules (
          title
        )
      `)
      .order('category');

    if (categoriesError) {
      console.error('❌ Erreur lors de la vérification:', categoriesError);
    } else {
      console.log(`✅ ${categories.length} catégories trouvées dans la table module_categories`);
      
      // Afficher quelques exemples
      console.log('\n📋 Exemples de catégories migrées:');
      const uniqueCategories = [...new Set(categories.map(c => c.category))];
      uniqueCategories.slice(0, 5).forEach(category => {
        const modulesInCategory = categories.filter(c => c.category === category);
        console.log(`  ${category}: ${modulesInCategory.length} modules`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

migrateToMultipleCategories(); 