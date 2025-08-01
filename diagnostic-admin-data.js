const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (utiliser les valeurs de env.example)
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnosticAdminData() {
  console.log('🔍 Diagnostic des données d\'administration');
  console.log('==========================================');
  console.log('');

  try {
    // 1. Vérifier la connexion Supabase
    console.log('1️⃣ Test de connexion Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('cartes')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError);
      return;
    }
    console.log('✅ Connexion Supabase OK');
    console.log('');

    // 2. Vérifier les cartes
    console.log('2️⃣ Vérification des cartes...');
    const { data: cards, error: cardsError } = await supabase
      .from('cartes')
      .select('*')
      .order('created_at', { ascending: false });

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
      if (articles.length > 0) {
        console.log('📋 Articles disponibles:');
        articles.forEach((article, index) => {
          console.log(`   ${index + 1}. ${article.title} (${article.category})`);
        });
      }
    }
    console.log('');

    // 4. Vérifier les utilisateurs/profiles
    console.log('4️⃣ Vérification des utilisateurs...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError);
    } else {
      console.log(`✅ ${profiles.length} profils trouvés`);
      if (profiles.length > 0) {
        console.log('📋 Utilisateurs disponibles:');
        profiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.email || 'Email non disponible'} (${profile.role})`);
        });
      }
    }
    console.log('');

    // 5. Vérifier la table detail_pages
    console.log('5️⃣ Vérification de la table detail_pages...');
    const { data: detailPages, error: detailPagesError } = await supabase
      .from('detail_pages')
      .select(`
        *,
        card:cartes(title)
      `)
      .order('created_at', { ascending: false });

    if (detailPagesError) {
      if (detailPagesError.code === '42P01') {
        console.log('❌ La table detail_pages n\'existe pas encore');
        console.log('💡 Pour la créer, exécutez le contenu de create-detail-pages-table.sql dans Supabase SQL Editor');
      } else {
        console.error('❌ Erreur lors de la récupération des pages détaillées:', detailPagesError);
      }
    } else {
      console.log(`✅ ${detailPages.length} pages détaillées trouvées`);
      if (detailPages.length > 0) {
        console.log('📋 Pages détaillées disponibles:');
        detailPages.forEach((page, index) => {
          console.log(`   ${index + 1}. ${page.title} (liée à: ${page.card?.title || 'Carte non trouvée'})`);
        });
      }
    }
    console.log('');

    // 6. Résumé
    console.log('📊 Résumé des données:');
    console.log(`   - Cartes: ${cards?.length || 0}`);
    console.log(`   - Articles: ${articles?.length || 0}`);
    console.log(`   - Utilisateurs: ${profiles?.length || 0}`);
    console.log(`   - Pages détaillées: ${detailPages?.length || 0}`);
    console.log('');

    // 7. Recommandations
    console.log('💡 Recommandations:');
    if (!cards || cards.length === 0) {
      console.log('   - Aucune carte trouvée. Créez des cartes via l\'interface d\'administration.');
    }
    if (!articles || articles.length === 0) {
      console.log('   - Aucun article trouvé. Créez des articles via l\'interface d\'administration.');
    }
    if (!profiles || profiles.length === 0) {
      console.log('   - Aucun utilisateur trouvé. Créez des comptes utilisateurs.');
    }
    if (detailPagesError && detailPagesError.code === '42P01') {
      console.log('   - Table detail_pages manquante. Exécutez le SQL de création.');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le diagnostic
diagnosticAdminData(); 