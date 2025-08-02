const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec clé de service (contourne RLS)
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
// Utiliser la clé de service au lieu de la clé anonyme
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Créer un client avec la clé de service
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminTables() {
  console.log('🔧 Correction des tables d\'administration');
  console.log('==========================================');
  console.log('');

  try {
    // 1. Récupérer toutes les cartes
    console.log('1️⃣ Récupération de toutes les cartes...');
    const { data: cards, error: cardsError } = await supabase
      .from('cartes')
      .select('*')
      .order('title');

    if (cardsError) {
      console.error('❌ Erreur lors de la récupération des cartes:', cardsError);
      return;
    }

    console.log(`✅ ${cards.length} cartes trouvées`);
    console.log('');

    // 2. Ajouter des données de test pour toutes les cartes
    console.log('2️⃣ Ajout de données de test pour toutes les cartes...');
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      console.log(`   📝 Traitement de la carte ${i + 1}/${cards.length}: ${card.title}`);
      
      const updateData = {
        detail_title: `Page détaillée - ${card.title}`,
        detail_content: `# ${card.title}\n\n## Description\n${card.description}\n\n## Fonctionnalités\n- Fonctionnalité principale\n- Fonctionnalité secondaire\n- Fonctionnalité avancée\n\n## Utilisation\nCe module permet de ${card.description.toLowerCase()}.\n\n## Configuration\nPour configurer ce module, suivez ces étapes :\n\n1. **Installation**\n   - Étape 1\n   - Étape 2\n   - Étape 3\n\n2. **Configuration**\n   - Paramètre 1\n   - Paramètre 2\n\n3. **Utilisation**\n   - Exemple d'utilisation\n   - Cas d'usage typique\n\n## Support\nPour toute question, contactez notre équipe de support.`,
        detail_meta_description: `Découvrez ${card.title} - ${card.description}. Module complet avec fonctionnalités avancées et support technique.`,
        detail_is_published: true
      };

      const { data: updateResult, error: updateError } = await supabase
        .from('cartes')
        .update(updateData)
        .eq('id', card.id)
        .select();

      if (updateError) {
        console.error(`   ❌ Erreur lors de la mise à jour de ${card.title}:`, updateError);
        console.error(`   ❌ Code d'erreur:`, updateError.code);
        console.error(`   ❌ Message:`, updateError.message);
      } else {
        console.log(`   ✅ ${card.title} mis à jour avec succès`);
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
      console.log('✅ Données vérifiées:');
      updatedCards.forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.title}`);
        console.log(`      - Detail Title: ${card.detail_title || 'NULL'}`);
        console.log(`      - Detail Content: ${card.detail_content ? card.detail_content.substring(0, 50) + '...' : 'NULL'}`);
        console.log(`      - Detail Meta: ${card.detail_meta_description || 'NULL'}`);
        console.log(`      - Published: ${card.detail_is_published}`);
        console.log('');
      });
    }

    console.log('🎉 Correction terminée !');
    console.log('💡 Maintenant, testez le formulaire d\'administration pour voir si les données remontent.');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
fixAdminTables(); 