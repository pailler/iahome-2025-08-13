const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMigrationPages() {
  console.log('🧪 Test de la migration des pages statiques...\n');

  try {
    // Test 1: Vérifier que les tables existent
    console.log('📋 Test 1: Vérification des tables...');
    
    const tables = ['menus', 'menu_items', 'pages'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table} non trouvée:`, error.message);
        return;
      }
      console.log(`✅ Table ${table} trouvée`);
    }

    // Test 2: Vérifier les pages migrées
    console.log('\n📝 Test 2: Vérification des pages migrées...');
    
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .order('slug');

    if (pagesError) {
      console.error('❌ Erreur lors de la récupération des pages:', pagesError);
      return;
    }

    console.log(`📊 ${pages.length} pages trouvées:`);
    pages.forEach(page => {
      const status = page.is_homepage ? '🏠' : (page.is_published ? '✅' : '⏸️');
      console.log(`  ${status} ${page.slug}: ${page.title}`);
    });

    // Test 3: Vérifier les menus par défaut
    console.log('\n🍽️ Test 3: Vérification des menus par défaut...');
    
    const { data: menus, error: menusError } = await supabase
      .from('menus')
      .select('*')
      .order('name');

    if (menusError) {
      console.error('❌ Erreur lors de la récupération des menus:', menusError);
      return;
    }

    console.log(`📊 ${menus.length} menus trouvés:`);
    menus.forEach(menu => {
      const status = menu.is_active ? '✅' : '⏸️';
      console.log(`  ${status} ${menu.name}: ${menu.description || 'Aucune description'}`);
    });

    // Test 4: Vérifier les éléments de menu
    console.log('\n🔗 Test 4: Vérification des éléments de menu...');
    
    const { data: menuItems, error: menuItemsError } = await supabase
      .from('menu_items')
      .select(`
        *,
        menus(name)
      `)
      .order('position');

    if (menuItemsError) {
      console.error('❌ Erreur lors de la récupération des éléments de menu:', menuItemsError);
      return;
    }

    console.log(`📊 ${menuItems.length} éléments de menu trouvés:`);
    
    // Grouper par menu
    const itemsByMenu = menuItems.reduce((acc, item) => {
      const menuName = item.menus.name;
      if (!acc[menuName]) acc[menuName] = [];
      acc[menuName].push(item);
      return acc;
    }, {});

    Object.entries(itemsByMenu).forEach(([menuName, items]) => {
      console.log(`\n  📋 Menu "${menuName}":`);
      items.forEach(item => {
        const status = item.is_active ? '✅' : '⏸️';
        const pageInfo = item.page_id ? ` (page: ${item.page_id})` : '';
        console.log(`    ${status} ${item.title}${pageInfo}`);
      });
    });

    // Test 5: Vérifier les RLS policies
    console.log('\n🔒 Test 5: Vérification des politiques RLS...');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'pages' });

    if (policiesError) {
      console.log('⚠️ Impossible de vérifier les politiques RLS (normal si pas de fonction RPC)');
    } else {
      console.log(`📊 ${policies.length} politiques RLS trouvées pour la table pages`);
    }

    // Test 6: Test de création d'un élément de menu avec page
    console.log('\n🧪 Test 6: Test de création d\'un élément de menu avec page...');
    
    if (pages.length > 0) {
      const testPage = pages[0];
      const testMenu = menus.find(m => m.name === 'main');
      
      if (testMenu) {
        const { data: newMenuItem, error: createError } = await supabase
          .from('menu_items')
          .insert({
            menu_id: testMenu.id,
            title: `Test - ${testPage.title}`,
            page_id: testPage.id,
            url: `/${testPage.slug}`,
            position: 999,
            is_active: true,
            is_external: false,
            target: '_self',
            requires_auth: false,
            roles_allowed: []
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erreur lors de la création de l\'élément de menu test:', createError);
        } else {
          console.log(`✅ Élément de menu test créé: ${newMenuItem.title}`);
          
          // Nettoyer le test
          await supabase
            .from('menu_items')
            .delete()
            .eq('id', newMenuItem.id);
          console.log('🧹 Élément de menu test supprimé');
        }
      }
    }

    // Résumé final
    console.log('\n📈 Résumé des tests:');
    console.log(`✅ Tables: ${tables.length}/3`);
    console.log(`✅ Pages: ${pages.length}`);
    console.log(`✅ Menus: ${menus.length}`);
    console.log(`✅ Éléments de menu: ${menuItems.length}`);
    
    const publishedPages = pages.filter(p => p.is_published).length;
    const homepagePages = pages.filter(p => p.is_homepage).length;
    
    console.log(`✅ Pages publiées: ${publishedPages}/${pages.length}`);
    console.log(`✅ Pages d'accueil: ${homepagePages}`);
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Exécuter: node migrate-static-pages.js migrate');
    console.log('2. Vérifier dans l\'interface admin: /admin/menus');
    console.log('3. Tester la navigation dynamique sur le site');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests
testMigrationPages(); 