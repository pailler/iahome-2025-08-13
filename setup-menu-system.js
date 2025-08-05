const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupMenuSystem() {
  console.log('🚀 Démarrage de la configuration du système de menus...');
  
  try {
    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'create-menu-tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📖 Lecture du fichier SQL...');
    
    // Diviser le SQL en requêtes individuelles
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));
    
    console.log(`📝 ${queries.length} requêtes SQL trouvées`);
    
    // Exécuter chaque requête
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        console.log(`⚡ Exécution de la requête ${i + 1}/${queries.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
          
          if (error) {
            console.error(`❌ Erreur lors de l'exécution de la requête ${i + 1}:`, error);
          } else {
            console.log(`✅ Requête ${i + 1} exécutée avec succès`);
          }
        } catch (err) {
          console.error(`❌ Exception lors de l'exécution de la requête ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('🎉 Configuration du système de menus terminée !');
    
    // Vérifier que les tables ont été créées
    console.log('\n🔍 Vérification des tables créées...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['menus', 'menu_items', 'pages']);
    
    if (tablesError) {
      console.error('❌ Erreur lors de la vérification des tables:', tablesError);
    } else {
      console.log('✅ Tables trouvées:', tables.map(t => t.table_name));
    }
    
    // Vérifier les données insérées
    console.log('\n📊 Vérification des données...');
    
    const { data: menus, error: menusError } = await supabase
      .from('menus')
      .select('*');
    
    if (menusError) {
      console.error('❌ Erreur lors de la vérification des menus:', menusError);
    } else {
      console.log(`✅ ${menus.length} menus trouvés:`, menus.map(m => m.name));
    }
    
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*');
    
    if (pagesError) {
      console.error('❌ Erreur lors de la vérification des pages:', pagesError);
    } else {
      console.log(`✅ ${pages.length} pages trouvées:`, pages.map(p => p.slug));
    }
    
    const { data: menuItems, error: menuItemsError } = await supabase
      .from('menu_items')
      .select('*');
    
    if (menuItemsError) {
      console.error('❌ Erreur lors de la vérification des éléments de menu:', menuItemsError);
    } else {
      console.log(`✅ ${menuItems.length} éléments de menu trouvés`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

// Fonction alternative utilisant des requêtes directes si exec_sql n'est pas disponible
async function setupMenuSystemDirect() {
  console.log('🚀 Configuration directe du système de menus...');
  
  try {
    // Créer la table menus
    console.log('📝 Création de la table menus...');
    const { error: menusError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS menus (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          position INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (menusError) {
      console.error('❌ Erreur lors de la création de la table menus:', menusError);
    } else {
      console.log('✅ Table menus créée');
    }
    
    // Créer la table menu_items
    console.log('📝 Création de la table menu_items...');
    const { error: menuItemsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS menu_items (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
          parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
          title VARCHAR(100) NOT NULL,
          url VARCHAR(500),
          page_id VARCHAR(100),
          icon VARCHAR(50),
          position INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          is_external BOOLEAN DEFAULT false,
          target VARCHAR(20) DEFAULT '_self',
          requires_auth BOOLEAN DEFAULT false,
          roles_allowed TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (menuItemsError) {
      console.error('❌ Erreur lors de la création de la table menu_items:', menuItemsError);
    } else {
      console.log('✅ Table menu_items créée');
    }
    
    // Créer la table pages
    console.log('📝 Création de la table pages...');
    const { error: pagesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS pages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          slug VARCHAR(100) NOT NULL UNIQUE,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          content TEXT,
          is_published BOOLEAN DEFAULT true,
          is_homepage BOOLEAN DEFAULT false,
          meta_title VARCHAR(200),
          meta_description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (pagesError) {
      console.error('❌ Erreur lors de la création de la table pages:', pagesError);
    } else {
      console.log('✅ Table pages créée');
    }
    
    // Insérer les données par défaut
    console.log('📝 Insertion des données par défaut...');
    
    // Insérer les menus
    const { error: insertMenusError } = await supabase
      .from('menus')
      .upsert([
        { name: 'main', description: 'Menu principal du site', position: 1 },
        { name: 'footer', description: 'Menu du pied de page', position: 2 },
        { name: 'mobile', description: 'Menu mobile', position: 3 }
      ], { onConflict: 'name' });
    
    if (insertMenusError) {
      console.error('❌ Erreur lors de l\'insertion des menus:', insertMenusError);
    } else {
      console.log('✅ Menus par défaut insérés');
    }
    
    // Insérer les pages
    const { error: insertPagesError } = await supabase
      .from('pages')
      .upsert([
        { slug: 'home', title: 'Accueil', description: 'Page d\'accueil du site', is_published: true },
        { slug: 'community', title: 'Communauté', description: 'Page de la communauté', is_published: true },
        { slug: 'blog', title: 'Blog', description: 'Page du blog', is_published: true },
        { slug: 'about', title: 'À propos', description: 'Page à propos', is_published: true },
        { slug: 'contact', title: 'Contact', description: 'Page de contact', is_published: true },
        { slug: 'pricing', title: 'Tarifs', description: 'Page des tarifs', is_published: true },
        { slug: 'privacy', title: 'Confidentialité', description: 'Politique de confidentialité', is_published: true },
        { slug: 'terms', title: 'Conditions', description: 'Conditions d\'utilisation', is_published: true }
      ], { onConflict: 'slug' });
    
    if (insertPagesError) {
      console.error('❌ Erreur lors de l\'insertion des pages:', insertPagesError);
    } else {
      console.log('✅ Pages par défaut insérées');
    }
    
    // Récupérer les IDs des menus et pages pour créer les éléments de menu
    const { data: menus } = await supabase.from('menus').select('id, name');
    const { data: pages } = await supabase.from('pages').select('id, slug');
    
    const mainMenu = menus?.find(m => m.name === 'main');
    const footerMenu = menus?.find(m => m.name === 'footer');
    const homePage = pages?.find(p => p.slug === 'home');
    const communityPage = pages?.find(p => p.slug === 'community');
    const blogPage = pages?.find(p => p.slug === 'blog');
    const aboutPage = pages?.find(p => p.slug === 'about');
    const contactPage = pages?.find(p => p.slug === 'contact');
    const pricingPage = pages?.find(p => p.slug === 'pricing');
    
    // Insérer les éléments de menu
    const menuItems = [];
    
    if (mainMenu) {
      if (homePage) {
        menuItems.push({
          menu_id: mainMenu.id,
          title: 'Accueil',
          url: '/',
          page_id: homePage.id,
          position: 1,
          is_active: true
        });
      }
      
      if (communityPage) {
        menuItems.push({
          menu_id: mainMenu.id,
          title: 'Communauté',
          url: '/community',
          page_id: communityPage.id,
          position: 2,
          is_active: true
        });
      }
      
      if (blogPage) {
        menuItems.push({
          menu_id: mainMenu.id,
          title: 'Blog',
          url: '/blog',
          page_id: blogPage.id,
          position: 3,
          is_active: true
        });
      }
    }
    
    if (footerMenu) {
      if (aboutPage) {
        menuItems.push({
          menu_id: footerMenu.id,
          title: 'À propos',
          url: '/about',
          page_id: aboutPage.id,
          position: 1,
          is_active: true
        });
      }
      
      if (contactPage) {
        menuItems.push({
          menu_id: footerMenu.id,
          title: 'Contact',
          url: '/contact',
          page_id: contactPage.id,
          position: 2,
          is_active: true
        });
      }
      
      if (pricingPage) {
        menuItems.push({
          menu_id: footerMenu.id,
          title: 'Tarifs',
          url: '/pricing',
          page_id: pricingPage.id,
          position: 3,
          is_active: true
        });
      }
    }
    
    if (menuItems.length > 0) {
      const { error: insertMenuItemsError } = await supabase
        .from('menu_items')
        .upsert(menuItems, { onConflict: 'id' });
      
      if (insertMenuItemsError) {
        console.error('❌ Erreur lors de l\'insertion des éléments de menu:', insertMenuItemsError);
      } else {
        console.log(`✅ ${menuItems.length} éléments de menu insérés`);
      }
    }
    
    console.log('🎉 Configuration du système de menus terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

// Exécuter la configuration
if (require.main === module) {
  setupMenuSystemDirect().catch(console.error);
}

module.exports = { setupMenuSystem, setupMenuSystemDirect }; 