const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec les vraies valeurs
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCartesStructure() {
  console.log('🔍 Vérification de la structure de la table cartes...\n');

  try {
    // Récupérer toutes les cartes pour voir la structure
    const { data: cartes, error: fetchError } = await supabase
      .from('cartes')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Erreur récupération cartes:', fetchError);
      return;
    }

    if (!cartes || cartes.length === 0) {
      console.log('❌ Aucune carte trouvée dans la table');
      return;
    }

    console.log(`📋 ${cartes.length} cartes trouvées`);
    console.log('\n🏗️  Structure de la table cartes:');
    
    // Afficher les colonnes de la première carte
    const firstCard = cartes[0];
    Object.keys(firstCard).forEach(column => {
      const value = firstCard[column];
      const type = Array.isArray(value) ? 'array' : typeof value;
      console.log(`   - ${column}: ${type} = ${JSON.stringify(value).substring(0, 100)}${JSON.stringify(value).length > 100 ? '...' : ''}`);
    });

    // Chercher spécifiquement la carte SDNext
    const { data: sdnextCard, error: sdnextError } = await supabase
      .from('cartes')
      .select('*')
      .ilike('title', '%sdnext%')
      .single();

    if (sdnextError) {
      console.log('\n❌ Carte SDNext non trouvée');
    } else {
      console.log('\n🎯 Carte SDNext trouvée:');
      console.log('   - ID:', sdnextCard.id);
      console.log('   - Titre:', sdnextCard.title);
      console.log('   - Description:', sdnextCard.description?.substring(0, 100) + '...');
      console.log('   - Catégorie:', sdnextCard.category);
      console.log('   - Prix:', sdnextCard.price);
      
      // Vérifier les colonnes d'image
      console.log('\n🖼️  Colonnes d\'image:');
      console.log('   - image_url:', sdnextCard.image_url ? '✅ Existe' : '❌ N\'existe pas');
      console.log('   - youtube_url:', sdnextCard.youtube_url ? '✅ Existe' : '❌ N\'existe pas');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
checkCartesStructure(); 