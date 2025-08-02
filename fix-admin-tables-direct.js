const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

async function fixAdminTablesDirect() {
  console.log('🔧 Correction des tables d\'administration (API REST directe)');
  console.log('============================================================');
  console.log('');

  try {
    // 1. Récupérer toutes les cartes via API REST
    console.log('1️⃣ Récupération de toutes les cartes via API REST...');
    const cardsResponse = await fetch(`${supabaseUrl}/rest/v1/cartes?select=*&order=title.asc`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    if (!cardsResponse.ok) {
      console.error('❌ Erreur lors de la récupération des cartes:', cardsResponse.status, cardsResponse.statusText);
      const errorText = await cardsResponse.text();
      console.error('❌ Détails:', errorText);
      return;
    }

    const cards = await cardsResponse.json();
    console.log(`✅ ${cards.length} cartes trouvées via API REST`);
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

      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/cartes?id=eq.${card.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        console.error(`   ❌ Erreur lors de la mise à jour de ${card.title}:`, updateResponse.status, updateResponse.statusText);
        const errorText = await updateResponse.text();
        console.error(`   ❌ Détails:`, errorText);
      } else {
        const updateResult = await updateResponse.json();
        console.log(`   ✅ ${card.title} mis à jour avec succès`);
        console.log(`   📊 Résultat:`, updateResult);
      }
    }

    console.log('');

    // 3. Vérifier les données mises à jour
    console.log('3️⃣ Vérification des données mises à jour...');
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/cartes?select=id,title,detail_title,detail_content,detail_meta_description,detail_is_published&order=title.asc&limit=5`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    if (!verifyResponse.ok) {
      console.error('❌ Erreur lors de la vérification:', verifyResponse.status, verifyResponse.statusText);
    } else {
      const updatedCards = await verifyResponse.json();
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
fixAdminTablesDirect(); 