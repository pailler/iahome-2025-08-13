const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCartesStructure() {
  console.log('🔍 Vérification de la structure de la table cartes');
  console.log('==================================================');
  console.log('');

  try {
    // 1. Récupérer un exemple de données pour voir les colonnes disponibles
    console.log('1️⃣ Récupération d\'un exemple de données...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('cartes')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Erreur lors de la récupération des données:', sampleError);
      return;
    }

    if (sampleData && sampleData.length > 0) {
      const sample = sampleData[0];
      console.log('✅ Données d\'exemple récupérées');
      console.log('📋 Colonnes disponibles:', Object.keys(sample));
      console.log('');
      
      // Vérifier les colonnes detail_*
      const detailColumns = ['detail_title', 'detail_content', 'detail_meta_description', 'detail_slug', 'detail_is_published'];
      console.log('🔍 Vérification des colonnes detail_*:');
      
      detailColumns.forEach(col => {
        if (sample.hasOwnProperty(col)) {
          console.log(`   ✅ ${col}: ${sample[col] || 'NULL'}`);
        } else {
          console.log(`   ❌ ${col}: MANQUANTE`);
        }
      });
      console.log('');

      // 2. Récupérer toutes les cartes pour voir les données actuelles
      console.log('2️⃣ Récupération de toutes les cartes...');
      const { data: allCards, error: allCardsError } = await supabase
        .from('cartes')
        .select('*')
        .order('title');

      if (allCardsError) {
        console.error('❌ Erreur lors de la récupération de toutes les cartes:', allCardsError);
      } else {
        console.log(`✅ ${allCards.length} cartes trouvées`);
        console.log('');
        
        // Afficher les données de chaque carte
        allCards.forEach((card, index) => {
          console.log(`${index + 1}. ${card.title}`);
          console.log(`   - Catégorie: ${card.category}`);
          console.log(`   - Prix: ${card.price}€`);
          console.log(`   - Description: ${card.description?.substring(0, 50)}...`);
          
          // Vérifier les champs detail_*
          if (card.detail_title) {
            console.log(`   - Detail Title: ${card.detail_title}`);
          }
          if (card.detail_content) {
            console.log(`   - Detail Content: ${card.detail_content?.substring(0, 50)}...`);
          }
          if (card.detail_meta_description) {
            console.log(`   - Detail Meta: ${card.detail_meta_description}`);
          }
          console.log('');
        });
      }

      // 3. Recommandations
      console.log('💡 Recommandations:');
      console.log('   1. Si les colonnes detail_* sont manquantes, exécutez le script SQL add-detail-columns.sql');
      console.log('   2. Si les colonnes existent mais sont vides, les données ne sont pas encore renseignées');
      console.log('   3. Vérifiez que le formulaire d\'administration charge correctement les données');
      console.log('');

    } else {
      console.log('⚠️ Aucune donnée trouvée dans la table cartes');
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
checkCartesStructure(); 