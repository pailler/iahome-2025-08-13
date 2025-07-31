// Script pour ajouter une URL YouTube fictive à la carte SDNext
// Utilise l'API REST de Supabase

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

async function addYouTubeToSDNext() {
  console.log('🎬 Ajout d\'une URL YouTube fictive à SDNext...\n');

  try {
    // D'abord, récupérer la carte SDNext pour obtenir son ID
    const response = await fetch(`${supabaseUrl}/rest/v1/cartes?title=ilike.*sdnext*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const cards = await response.json();
    
    if (cards.length === 0) {
      console.log('❌ Carte SDNext non trouvée');
      return;
    }

    const sdnextCard = cards[0];
    console.log(`📋 Carte trouvée: ${sdnextCard.title} (ID: ${sdnextCard.id})`);

    // Mettre à jour avec l'URL YouTube fictive
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/cartes?id=eq.${sdnextCard.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        youtube_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Erreur de mise à jour: ${updateResponse.status}`);
    }

    console.log('✅ URL YouTube ajoutée avec succès !');
    console.log('🔗 https://www.youtube.com/embed/dQw4w9WgXcQ');
    console.log('\n💡 Cette URL YouTube fictive sera affichée sur la page détaillée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Instructions manuelles:');
    console.log('1. Allez dans l\'interface Supabase');
    console.log('2. Ouvrez la table "cartes"');
    console.log('3. Trouvez la carte SDNext');
    console.log('4. Mettez à jour le champ "youtube_url" avec:');
    console.log('   https://www.youtube.com/embed/dQw4w9WgXcQ');
  }
}

addYouTubeToSDNext(); 