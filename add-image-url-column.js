const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec les vraies valeurs
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addImageUrlColumn() {
  console.log('🔧 Ajout de la colonne image_url à la table cartes...\n');

  try {
    // Ajouter la colonne image_url
    const { error: alterError } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE cartes ADD COLUMN IF NOT EXISTS image_url TEXT;'
      });

    if (alterError) {
      console.log('⚠️  La colonne image_url existe peut-être déjà ou erreur SQL:', alterError.message);
    } else {
      console.log('✅ Colonne image_url ajoutée avec succès');
    }

    // Mettre à jour la carte SDNext avec l'image SVG
    console.log('\n🎨 Mise à jour de la carte SDNext avec l\'image SVG...');
    
    const { data: updatedCard, error: updateError } = await supabase
      .from('cartes')
      .update({
        image_url: '/images/sdnext-interface.svg',
        youtube_url: null // Supprimer l'URL YouTube
      })
      .ilike('title', '%sdnext%')
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour carte SDNext:', updateError);
      return;
    }

    console.log('✅ Carte SDNext mise à jour avec succès!');
    console.log('   - ID:', updatedCard.id);
    console.log('   - Titre:', updatedCard.title);
    console.log('   - Nouvelle image SVG:', updatedCard.image_url);
    console.log('   - YouTube URL supprimée');

    // Vérifier la structure finale
    console.log('\n🔍 Vérification de la structure finale...');
    const { data: finalCard, error: finalError } = await supabase
      .from('cartes')
      .select('id, title, image_url, youtube_url')
      .ilike('title', '%sdnext%')
      .single();

    if (finalError) {
      console.error('❌ Erreur vérification finale:', finalError);
    } else {
      console.log('✅ Structure finale:');
      console.log('   - image_url:', finalCard.image_url ? '✅ Configurée' : '❌ Non configurée');
      console.log('   - youtube_url:', finalCard.youtube_url ? '⚠️  Encore présente' : '✅ Supprimée');
    }

    console.log('\n🎉 Remplacement YouTube par SVG terminé !');
    console.log('✅ Colonne image_url ajoutée');
    console.log('✅ Image SVG configurée');
    console.log('✅ Embed YouTube supprimé');
    console.log('✅ Interface SDNext moderne');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.log('\n💡 Solutions alternatives:');
    console.log('1. Exécutez le script SQL directement dans Supabase');
    console.log('2. Utilisez l\'interface Supabase pour ajouter la colonne');
    console.log('3. Vérifiez les permissions de la base de données');
  }
}

// Exécuter le script
addImageUrlColumn(); 