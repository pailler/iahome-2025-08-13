const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkModulesTable() {
  console.log('🔍 Diagnostic de la table modules...\n');

  try {
    // 1. Compter tous les modules
    console.log('📊 Comptage total des modules...');
    const { count, error: countError } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erreur comptage:', countError.message);
    } else {
      console.log(`✅ Total des modules dans la base : ${count}`);
    }

    // 2. Récupérer tous les modules avec leurs détails
    console.log('\n📋 Récupération de tous les modules...');
    const { data: allModules, error: allModulesError } = await supabase
      .from('modules')
      .select('*')
      .order('title', { ascending: true });

    if (allModulesError) {
      console.log('❌ Erreur récupération:', allModulesError.message);
    } else {
      console.log(`✅ ${allModules?.length || 0} modules récupérés :`);
      if (allModules && allModules.length > 0) {
        allModules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.title} (${module.category}, ${module.price})`);
          console.log(`      Description: ${module.description?.substring(0, 100)}...`);
        });
      }
    }

    // 3. Vérifier la structure de la table
    console.log('\n🏗️ Structure de la table modules...');
    const { data: structure, error: structureError } = await supabase
      .rpc('get_table_info', { table_name: 'modules' });

    if (structureError) {
      console.log('⚠️ Impossible de récupérer la structure (normal si la fonction n\'existe pas)');
      console.log('💡 Vérifiez manuellement dans votre dashboard Supabase');
    } else {
      console.log('Structure:', structure);
    }

    // 4. Vérifier s'il y a des filtres ou des conditions
    console.log('\n🔍 Vérification des conditions...');
    console.log('Recherche de modules avec différentes conditions :');
    
    // Modules publiés
    const { data: publishedModules, error: publishedError } = await supabase
      .from('modules')
      .select('title, is_published')
      .eq('is_published', true);
    
    console.log(`   - Modules publiés (is_published = true) : ${publishedModules?.length || 0}`);
    
    // Modules non publiés
    const { data: unpublishedModules, error: unpublishedError } = await supabase
      .from('modules')
      .select('title, is_published')
      .eq('is_published', false);
    
    console.log(`   - Modules non publiés (is_published = false) : ${unpublishedModules?.length || 0}`);
    
    // Modules sans statut de publication
    const { data: noStatusModules, error: noStatusError } = await supabase
      .from('modules')
      .select('title, is_published')
      .is('is_published', null);
    
    console.log(`   - Modules sans statut (is_published = null) : ${noStatusModules?.length || 0}`);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }

  console.log('\n✨ Diagnostic terminé');
  console.log('\n💡 Si vous voyez moins de modules que prévu, vérifiez :');
  console.log('   1. Les permissions RLS sur la table modules');
  console.log('   2. Le statut de publication des modules (is_published)');
  console.log('   3. Les politiques d\'accès dans Supabase');
}

// Exécuter le diagnostic
checkModulesTable().catch(console.error); 