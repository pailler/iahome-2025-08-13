const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSingleUpdate() {
  console.log('🧪 Test de mise à jour d\'une seule carte');
  console.log('==========================================');
  console.log('');

  try {
    // 1. Récupérer la première carte
    console.log('1️⃣ Récupération de la première carte...');
    const { data: cards, error: cardsError } = await supabase
      .from('cartes')
      .select('id, title')
      .limit(1);

    if (cardsError) {
      console.error('❌ Erreur lors de la récupération:', cardsError);
      return;
    }

    if (!cards || cards.length === 0) {
      console.error('❌ Aucune carte trouvée');
      return;
    }

    const card = cards[0];
    console.log(`✅ Carte trouvée: ${card.title} (ID: ${card.id})`);
    console.log('');

    // 2. Tenter la mise à jour
    console.log('2️⃣ Tentative de mise à jour...');
    const updateData = {
      detail_title: 'Test - ' + card.title,
      detail_content: 'Contenu de test pour ' + card.title,
      detail_meta_description: 'Description de test pour ' + card.title,
      detail_is_published: true
    };

    console.log('📝 Données à mettre à jour:', updateData);

    const { data: updateResult, error: updateError } = await supabase
      .from('cartes')
      .update(updateData)
      .eq('id', card.id)
      .select();

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      console.error('❌ Code d\'erreur:', updateError.code);
      console.error('❌ Message d\'erreur:', updateError.message);
      console.error('❌ Détails:', updateError.details);
      return;
    }

    console.log('✅ Mise à jour réussie !');
    console.log('📊 Résultat:', updateResult);

    // 3. Vérifier la mise à jour
    console.log('');
    console.log('3️⃣ Vérification de la mise à jour...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('cartes')
      .select('id, title, detail_title, detail_content, detail_meta_description, detail_is_published')
      .eq('id', card.id)
      .single();

    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
    } else {
      console.log('✅ Données vérifiées:');
      console.log('   - ID:', verifyData.id);
      console.log('   - Title:', verifyData.title);
      console.log('   - Detail Title:', verifyData.detail_title);
      console.log('   - Detail Content:', verifyData.detail_content);
      console.log('   - Detail Meta:', verifyData.detail_meta_description);
      console.log('   - Published:', verifyData.detail_is_published);
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
testSingleUpdate(); 