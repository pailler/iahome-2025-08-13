// Utiliser fetch natif de Node.js

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

async function addImageUrlColumnViaRest() {
  console.log('🔧 Ajout de la colonne image_url via API REST...\n');

  try {
    // Essayer d'ajouter la colonne via une requête SQL directe
    const sqlQuery = `
      ALTER TABLE cartes 
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        sql: sqlQuery
      })
    });

    if (!response.ok) {
      console.log('⚠️  Impossible d\'ajouter la colonne via API REST');
      console.log('💡 La colonne doit être ajoutée manuellement dans Supabase');
      
      // Essayer de mettre à jour directement avec les colonnes existantes
      console.log('\n🔄 Tentative de mise à jour avec les colonnes existantes...');
      
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/cartes?id=eq.877fda73-750c-4254-ac58-44c7f51a40d2`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          youtube_url: null // Supprimer seulement l'URL YouTube pour l'instant
        })
      });

      if (updateResponse.ok) {
        const updatedCard = await updateResponse.json();
        console.log('✅ YouTube URL supprimée temporairement');
        console.log('💡 Ajoutez manuellement la colonne image_url dans Supabase');
        console.log('💡 Puis mettez à jour avec l\'image SVG');
      } else {
        console.error('❌ Erreur mise à jour:', updateResponse.statusText);
      }
      
      return;
    }

    const result = await response.json();
    console.log('✅ Colonne image_url ajoutée avec succès');

    // Maintenant mettre à jour la carte SDNext
    console.log('\n🎨 Mise à jour de la carte SDNext...');
    
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/cartes?id=eq.877fda73-750c-4254-ac58-44c7f51a40d2`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        image_url: '/images/sdnext-interface.svg',
        youtube_url: null
      })
    });

    if (updateResponse.ok) {
      const updatedCard = await updateResponse.json();
      console.log('✅ Carte SDNext mise à jour avec succès!');
      console.log('   - Image SVG:', updatedCard[0]?.image_url);
      console.log('   - YouTube URL supprimée');
    } else {
      console.error('❌ Erreur mise à jour:', updateResponse.statusText);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.log('\n💡 Instructions manuelles:');
    console.log('1. Allez dans l\'interface Supabase');
    console.log('2. Ouvrez la table "cartes"');
    console.log('3. Ajoutez une colonne "image_url" de type TEXT');
    console.log('4. Mettez à jour la carte SDNext avec "/images/sdnext-interface.svg"');
    console.log('5. Supprimez l\'URL YouTube');
  }
}

// Exécuter le script
addImageUrlColumnViaRest(); 