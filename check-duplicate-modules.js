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

async function checkDuplicateModules() {
  console.log('🔍 Vérification des modules en double...');
  console.log('=' .repeat(60));

  try {
    // 1. Récupérer tous les modules
    console.log('1️⃣ Récupération de tous les modules...');
    const { data: modules, error } = await supabase
      .from('modules')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('❌ Erreur lors de la récupération des modules:', error);
      return;
    }

    console.log(`   ✅ ${modules.length} modules récupérés\n`);

    // 2. Analyser les doublons
    console.log('2️⃣ Analyse des doublons...');
    const titleCounts = {};
    const duplicates = [];

    modules.forEach(module => {
      const title = module.title.trim();
      if (!titleCounts[title]) {
        titleCounts[title] = [];
      }
      titleCounts[title].push(module);
    });

    // Identifier les doublons
    Object.keys(titleCounts).forEach(title => {
      if (titleCounts[title].length > 1) {
        duplicates.push({
          title: title,
          modules: titleCounts[title]
        });
      }
    });

    if (duplicates.length === 0) {
      console.log('   ✅ Aucun doublon trouvé !');
      return;
    }

    console.log(`   ⚠️ ${duplicates.length} titre(s) avec des doublons trouvé(s):\n`);

    // 3. Afficher les doublons
    duplicates.forEach((duplicate, index) => {
      console.log(`   ${index + 1}. "${duplicate.title}" (${duplicate.modules.length} occurrences):`);
      duplicate.modules.forEach((module, moduleIndex) => {
        console.log(`      - ID: ${module.id}, Créé: ${module.created_at}, Prix: ${module.price}`);
      });
      console.log('');
    });

    // 4. Proposer le nettoyage
    console.log('3️⃣ Proposition de nettoyage...');
    console.log('   Les modules les plus récents seront conservés, les plus anciens supprimés.\n');

    for (const duplicate of duplicates) {
      console.log(`   📝 Pour "${duplicate.title}":`);
      
      // Trier par date de création (le plus récent en premier)
      const sortedModules = duplicate.modules.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      const toKeep = sortedModules[0];
      const toDelete = sortedModules.slice(1);

      console.log(`      ✅ Garder: ID ${toKeep.id} (créé le ${toKeep.created_at})`);
      toDelete.forEach(module => {
        console.log(`      ❌ Supprimer: ID ${module.id} (créé le ${module.created_at})`);
      });
      console.log('');
    }

    // 5. Demander confirmation
    console.log('4️⃣ Voulez-vous procéder au nettoyage ?');
    console.log('   ⚠️ Cette action est irréversible !');
    console.log('   Tapez "YES" pour confirmer, ou appuyez sur Ctrl+C pour annuler.');

    // Simuler une confirmation automatique pour le script
    const shouldClean = process.argv.includes('--clean');
    
    if (shouldClean) {
      console.log('   🔄 Nettoyage automatique activé...');
      await cleanDuplicates(duplicates);
    } else {
      console.log('   💡 Pour nettoyer automatiquement, relancez avec: node check-duplicate-modules.js --clean');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

async function cleanDuplicates(duplicates) {
  console.log('\n🧹 Début du nettoyage des doublons...');
  
  let totalDeleted = 0;
  let totalErrors = 0;

  for (const duplicate of duplicates) {
    console.log(`\n   🔄 Nettoyage de "${duplicate.title}"...`);
    
    // Trier par date de création (le plus récent en premier)
    const sortedModules = duplicate.modules.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    const toKeep = sortedModules[0];
    const toDelete = sortedModules.slice(1);

    console.log(`      ✅ Garder: ID ${toKeep.id}`);
    
    // Supprimer les doublons
    for (const module of toDelete) {
      try {
        const { error } = await supabase
          .from('modules')
          .delete()
          .eq('id', module.id);

        if (error) {
          console.error(`      ❌ Erreur lors de la suppression de l'ID ${module.id}:`, error);
          totalErrors++;
        } else {
          console.log(`      ✅ Supprimé: ID ${module.id}`);
          totalDeleted++;
        }
      } catch (error) {
        console.error(`      ❌ Erreur lors de la suppression de l'ID ${module.id}:`, error);
        totalErrors++;
      }
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🎉 Nettoyage terminé !');
  console.log(`   ✅ Modules supprimés: ${totalDeleted}`);
  console.log(`   ❌ Erreurs: ${totalErrors}`);
  
  if (totalErrors === 0) {
    console.log('   🎯 Tous les doublons ont été supprimés avec succès !');
  } else {
    console.log('   ⚠️ Certaines erreurs sont survenues. Vérifiez les logs ci-dessus.');
  }
}

// Exécuter la vérification
checkDuplicateModules(); 