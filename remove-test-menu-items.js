const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function removeTestMenuItems() {
  try {
    console.log('🧹 Suppression des éléments de menu de test...\n');

    // 1. Afficher TOUS les éléments de menu pour diagnostic
    console.log('📋 Tous les éléments de menu actuels :');
    const { data: allItems, error: allError } = await supabase
      .from('menu_items')
      .select('id, title, url, position, is_active')
      .order('position');

    if (allError) {
      console.error('❌ Erreur lors de la récupération de tous les éléments:', allError);
      return;
    }

    if (allItems && allItems.length > 0) {
      allItems.forEach(item => {
        console.log(`  - ${item.title} (position: ${item.position}, actif: ${item.is_active})`);
      });
    }

    // 2. Supprimer TOUS les éléments contenant "Test", "Éditeur", "HTML", "Final"
    console.log('\n🗑️ Suppression de tous les éléments de test...');
    
    // Suppression par critères multiples
    const { error: deleteError1 } = await supabase
      .from('menu_items')
      .delete()
      .or('title.ilike.%test%,title.ilike.%éditeur%,title.ilike.%html%,title.ilike.%final%');

    if (deleteError1) {
      console.error('❌ Erreur lors de la première suppression:', deleteError1);
    } else {
      console.log('✅ Première suppression effectuée');
    }

    // Suppression spécifique par titre exact
    const testTitles = [
      'Test Éditeur HTML',
      'Test Éditeur HTML Final',
      'Test Éditeur',
      'Éditeur HTML',
      'Test HTML'
    ];

    for (const title of testTitles) {
      const { error: deleteError2 } = await supabase
        .from('menu_items')
        .delete()
        .eq('title', title);
      
      if (deleteError2) {
        console.error(`❌ Erreur lors de la suppression de "${title}":`, deleteError2);
      } else {
        console.log(`✅ Suppression de "${title}" effectuée`);
      }
    }

    // 3. Vérifier les éléments restants
    console.log('\n📋 Éléments de menu restants après nettoyage :');
    const { data: remainingItems, error: remainingError } = await supabase
      .from('menu_items')
      .select('id, title, url, position, is_active')
      .order('position');

    if (remainingError) {
      console.error('❌ Erreur lors de la vérification finale:', remainingError);
      return;
    }

    if (remainingItems && remainingItems.length > 0) {
      remainingItems.forEach(item => {
        console.log(`  - ${item.title} (position: ${item.position})`);
      });
    } else {
      console.log('  Aucun élément de menu restant');
    }

    console.log('\n🎉 Nettoyage terminé avec succès !');
    console.log('💡 Rafraîchissez votre navigateur pour voir les changements.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
removeTestMenuItems(); 