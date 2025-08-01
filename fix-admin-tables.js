const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAdminTables() {
  console.log('🔧 Correction des tables d\'administration');
  console.log('==========================================');
  console.log('');

  try {
    // 1. Vérifier la structure actuelle de la table cartes
    console.log('1️⃣ Vérification de la structure de la table cartes...');
    const { data: cartesData, error: cartesError } = await supabase
      .from('cartes')
      .select('*')
      .limit(1);

    if (cartesError) {
      console.error('❌ Erreur lors de la vérification des cartes:', cartesError);
    } else {
      console.log('✅ Table cartes accessible');
      console.log('📋 Colonnes disponibles:', Object.keys(cartesData[0] || {}));
    }
    console.log('');

    // 2. Essayer de récupérer les cartes sans created_at
    console.log('2️⃣ Récupération des cartes existantes...');
    const { data: cards, error: cardsError } = await supabase
      .from('cartes')
      .select('id, title, description, category, price, youtube_url');

    if (cardsError) {
      console.error('❌ Erreur lors de la récupération des cartes:', cardsError);
    } else {
      console.log(`✅ ${cards.length} cartes trouvées`);
      if (cards.length > 0) {
        console.log('📋 Cartes disponibles:');
        cards.forEach((card, index) => {
          console.log(`   ${index + 1}. ${card.title} (${card.category}) - €${card.price}`);
        });
      }
    }
    console.log('');

    // 3. Vérifier les articles de blog
    console.log('3️⃣ Vérification des articles de blog...');
    const { data: articles, error: articlesError } = await supabase
      .from('blog_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (articlesError) {
      console.error('❌ Erreur lors de la récupération des articles:', articlesError);
    } else {
      console.log(`✅ ${articles.length} articles trouvés`);
    }
    console.log('');

    // 4. Vérifier les utilisateurs
    console.log('4️⃣ Vérification des utilisateurs...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError);
    } else {
      console.log(`✅ ${profiles.length} utilisateurs trouvés`);
    }
    console.log('');

    // 5. Résumé et recommandations
    console.log('📊 Résumé des données disponibles:');
    console.log(`   - Cartes: ${cards?.length || 0}`);
    console.log(`   - Articles: ${articles?.length || 0}`);
    console.log(`   - Utilisateurs: ${profiles?.length || 0}`);
    console.log('');

    console.log('💡 Actions recommandées:');
    console.log('   1. Exécuter le script SQL fix-cartes-table.sql dans Supabase SQL Editor');
    console.log('   2. Exécuter le script SQL create-detail-pages-table.sql dans Supabase SQL Editor');
    console.log('   3. Redémarrer l\'application pour voir les changements');
    console.log('');

    // 6. Test de l'interface d'administration
    console.log('6️⃣ Test de l\'interface d\'administration...');
    console.log('   - Accédez à /admin pour voir le tableau de bord');
    console.log('   - Accédez à /admin/cartes pour gérer les cartes');
    console.log('   - Accédez à /admin/blog pour gérer les articles');
    console.log('   - Accédez à /admin/users pour gérer les utilisateurs');
    console.log('   - Accédez à /admin/pages-detaillees pour gérer les pages détaillées (après création de la table)');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
fixAdminTables(); 