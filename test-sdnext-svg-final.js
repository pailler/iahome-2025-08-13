const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec les vraies valeurs
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSDNextSVGFinal() {
  console.log('🎨 Test final - Image SVG SDNext\n');

  try {
    // Vérifier la carte SDNext
    const { data: sdnextCard, error: cardError } = await supabase
      .from('cartes')
      .select('*')
      .ilike('title', '%sdnext%')
      .single();

    if (cardError) {
      console.error('❌ Erreur récupération carte SDNext:', cardError);
      return;
    }

    console.log('✅ Carte SDNext trouvée:');
    console.log('   - ID:', sdnextCard.id);
    console.log('   - Titre:', sdnextCard.title);
    console.log('   - Image URL:', sdnextCard.image_url || '❌ Non configurée');
    console.log('   - YouTube URL:', sdnextCard.youtube_url || '✅ Supprimée');

    // Vérifier la configuration
    if (sdnextCard.image_url === '/images/sdnext-interface.svg') {
      console.log('\n✅ Configuration correcte !');
      console.log('   - Image SVG configurée');
      console.log('   - YouTube URL supprimée');
      
      console.log('\n🎉 Test de l\'affichage:');
      console.log('   1. Ouvrez votre navigateur');
      console.log('   2. Allez sur: http://localhost:8021');
      console.log('   3. Trouvez la carte "SDNext"');
      console.log('   4. Vérifiez que l\'image SVG s\'affiche');
      console.log('   5. Survolez l\'image pour l\'effet hover');
      
      console.log('\n🔗 URLs de test:');
      console.log('   - Image SVG: http://localhost:8021/images/sdnext-interface.svg');
      console.log('   - Site principal: http://localhost:8021');
      
    } else {
      console.log('\n⚠️  Configuration incomplète:');
      console.log('   - Image URL attendue: /images/sdnext-interface.svg');
      console.log('   - Image URL actuelle:', sdnextCard.image_url);
      
      console.log('\n💡 Actions à effectuer:');
      console.log('   1. Ajoutez la colonne image_url dans Supabase');
      console.log('   2. Configurez /images/sdnext-interface.svg pour la carte SDNext');
      console.log('   3. Vérifiez que youtube_url est null');
    }

    // Vérifier l'accessibilité de l'image
    console.log('\n🔍 Test d\'accessibilité de l\'image SVG...');
    
    try {
      const response = await fetch('http://localhost:8021/images/sdnext-interface.svg');
      if (response.ok) {
        console.log('✅ Image SVG accessible');
        console.log('   - Status:', response.status);
        console.log('   - Content-Type:', response.headers.get('content-type'));
      } else {
        console.log('❌ Image SVG non accessible');
        console.log('   - Status:', response.status);
      }
    } catch (fetchError) {
      console.log('❌ Erreur accès image SVG:', fetchError.message);
      console.log('💡 Vérifiez que le serveur Next.js tourne sur le port 8021');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testSDNextSVGFinal(); 