const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Utiliser la clé service_role pour contourner les politiques RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function removeTestMenuItemsAdmin() {
  try {
    console.log('🧹 Suppression ADMIN des éléments de menu de test...\n');

    // 1. Afficher TOUS les éléments de menu
    console.log('📋 Tous les éléments de menu actuels :');
    const { data: allItems, error: allError } = await supabase
      .from('menu_items')
      .select('id, title, url, position, is_active')
      .order('position');

    if (allError) {
      console.error('❌ Erreur lors de la récupération:', allError);
      return;
    }

    if (allItems && allItems.length > 0) {
      allItems.forEach(item => {
        console.log(`  - ${item.title} (ID: ${item.id}, position: ${item.position})`);
      });
    }

    // 2. Identifier les éléments de test par ID
    const testItems = allItems.filter(item => 
      item.title.toLowerCase().includes('test') ||
      item.title.toLowerCase().includes('éditeur') ||
      item.title.toLowerCase().includes('html') ||
      item.title.toLowerCase().includes('final')
    );

    if (testItems.length === 0) {
      console.log('✅ Aucun élément de test trouvé');
      return;
    }

    console.log(`\n🗑️ Suppression de ${testItems.length} éléments de test...`);

    // 3. Supprimer chaque élément de test par ID
    for (const item of testItems) {
      console.log(`  Suppression de "${item.title}" (ID: ${item.id})...`);
      
      const { error: deleteError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id);
      
      if (deleteError) {
        console.error(`❌ Erreur lors de la suppression de "${item.title}":`, deleteError);
      } else {
        console.log(`✅ "${item.title}" supprimé avec succès`);
      }
    }

    // 4. Vérification finale
    console.log('\n📋 Éléments de menu restants :');
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

    console.log('\n🎉 Nettoyage ADMIN terminé avec succès !');
    console.log('💡 Rafraîchissez votre navigateur pour voir les changements.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
removeTestMenuItemsAdmin(); 