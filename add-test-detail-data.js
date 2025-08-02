const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addTestDetailData() {
  console.log('🧪 Ajout de données de test dans les colonnes detail_*');
  console.log('=====================================================');
  console.log('');

  try {
    // 1. Récupérer les cartes existantes
    console.log('1️⃣ Récupération des cartes existantes...');
    const { data: cards, error: cardsError } = await supabase
      .from('cartes')
      .select('id, title')
      .order('title');

    if (cardsError) {
      console.error('❌ Erreur lors de la récupération des cartes:', cardsError);
      return;
    }

    console.log(`✅ ${cards.length} cartes trouvées`);
    console.log('');

    // 2. Ajouter des données de test pour les 3 premières cartes
    const testData = [
      {
        id: cards[0]?.id,
        detail_title: 'Page détaillée - ' + cards[0]?.title,
        detail_content: 'Contenu détaillé pour ' + cards[0]?.title + '.\n\n## Fonctionnalités\n- Fonctionnalité 1\n- Fonctionnalité 2\n- Fonctionnalité 3\n\n## Utilisation\nCe module permet de...',
        detail_meta_description: 'Description SEO pour ' + cards[0]?.title,
        detail_is_published: true
      },
      {
        id: cards[1]?.id,
        detail_title: 'Page détaillée - ' + cards[1]?.title,
        detail_content: 'Contenu détaillé pour ' + cards[1]?.title + '.\n\n## Avantages\n- Avantage 1\n- Avantage 2\n\n## Configuration\nPour configurer ce module...',
        detail_meta_description: 'Description SEO pour ' + cards[1]?.title,
        detail_is_published: false
      },
      {
        id: cards[2]?.id,
        detail_title: 'Page détaillée - ' + cards[2]?.title,
        detail_content: 'Contenu détaillé pour ' + cards[2]?.title + '.\n\n## Installation\n1. Étape 1\n2. Étape 2\n3. Étape 3\n\n## Exemples\nVoici quelques exemples d\'utilisation...',
        detail_meta_description: 'Description SEO pour ' + cards[2]?.title,
        detail_is_published: true
      }
    ];

    console.log('2️⃣ Ajout des données de test...');
    
    for (const data of testData) {
      if (data.id) {
        console.log(`   📝 Mise à jour de la carte: ${data.detail_title}`);
        
        const { error: updateError } = await supabase
          .from('cartes')
          .update({
            detail_title: data.detail_title,
            detail_content: data.detail_content,
            detail_meta_description: data.detail_meta_description,
            detail_is_published: data.detail_is_published
          })
          .eq('id', data.id);

        if (updateError) {
          console.error(`   ❌ Erreur lors de la mise à jour de ${data.detail_title}:`, updateError);
        } else {
          console.log(`   ✅ ${data.detail_title} mis à jour avec succès`);
        }
      }
    }

    console.log('');

    // 3. Vérifier les données mises à jour
    console.log('3️⃣ Vérification des données mises à jour...');
    const { data: updatedCards, error: verifyError } = await supabase
      .from('cartes')
      .select('id, title, detail_title, detail_content, detail_meta_description, detail_is_published')
      .order('title')
      .limit(5);

    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
    } else {
      console.log('✅ Données mises à jour:');
      updatedCards.forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.title}`);
        if (card.detail_title) {
          console.log(`      - Detail Title: ${card.detail_title}`);
          console.log(`      - Detail Content: ${card.detail_content?.substring(0, 50)}...`);
          console.log(`      - Detail Meta: ${card.detail_meta_description}`);
          console.log(`      - Published: ${card.detail_is_published}`);
        } else {
          console.log(`      - Pas de données détaillées`);
        }
        console.log('');
      });
    }

    console.log('🎉 Test terminé !');
    console.log('💡 Maintenant, testez le formulaire d\'administration pour voir si les données remontent.');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
addTestDetailData(); 