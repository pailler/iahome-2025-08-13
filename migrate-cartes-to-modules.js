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

async function migrateCartesToModules() {
  console.log('🔄 Migration des cartes vers la table modules...\n');

  try {
    // 1. Récupérer toutes les cartes
    console.log('📋 Récupération des cartes...');
    const { data: cartes, error: cartesError } = await supabase
      .from('cartes')
      .select('*')
      .order('title', { ascending: true });

    if (cartesError) {
      console.error('❌ Erreur récupération cartes:', cartesError.message);
      return;
    }

    console.log(`✅ ${cartes?.length || 0} cartes trouvées`);

    if (!cartes || cartes.length === 0) {
      console.log('ℹ️ Aucune carte à migrer');
      return;
    }

    // 2. Préparer les données pour la migration
    console.log('\n🔄 Préparation des données...');
    const modulesToInsert = cartes.map(carte => ({
      title: carte.title,
      description: carte.description || '',
      category: carte.category || 'Général',
      price: carte.price || 0,
      created_at: carte.created_at || new Date().toISOString()
    }));

    console.log(`✅ ${modulesToInsert.length} modules préparés pour l'insertion`);

    // 3. Insérer les modules dans la table modules
    console.log('\n📥 Insertion des modules...');
    const { data: insertedModules, error: insertError } = await supabase
      .from('modules')
      .insert(modulesToInsert)
      .select();

    if (insertError) {
      console.error('❌ Erreur insertion modules:', insertError.message);
      return;
    }

    console.log(`✅ ${insertedModules?.length || 0} modules insérés avec succès`);

    // 4. Vérifier que tous les modules sont bien présents
    console.log('\n🔍 Vérification de la migration...');
    const { data: allModules, error: checkError } = await supabase
      .from('modules')
      .select('*')
      .order('title', { ascending: true });

    if (checkError) {
      console.error('❌ Erreur vérification:', checkError.message);
    } else {
      console.log(`✅ Total des modules après migration : ${allModules?.length || 0}`);
      
      if (allModules && allModules.length > 0) {
        console.log('\n📋 Modules migrés :');
        allModules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.title} (${module.category}, ${module.price}€)`);
        });
      }
    }

    // 5. Demander confirmation pour supprimer la table cartes
    console.log('\n⚠️ ATTENTION : Voulez-vous supprimer la table cartes ?');
    console.log('   Cette action est irréversible !');
    console.log('   Tapez "SUPPRIMER" pour confirmer :');
    
    // Pour l'instant, on ne supprime pas automatiquement
    console.log('   (La suppression automatique est désactivée pour sécurité)');
    console.log('   Exécutez manuellement dans Supabase : DROP TABLE cartes;');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }

  console.log('\n✨ Migration terminée');
  console.log('\n📝 Prochaines étapes :');
  console.log('1. Vérifiez que tous les modules sont bien présents dans la table modules');
  console.log('2. Testez votre application pour vous assurer que tout fonctionne');
  console.log('3. Si tout est OK, supprimez la table cartes dans Supabase');
  console.log('4. Mettez à jour votre chat IA pour utiliser la table modules');
}

// Exécuter la migration
migrateCartesToModules().catch(console.error); 