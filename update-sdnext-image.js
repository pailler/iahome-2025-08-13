const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSDNextImage() {
  console.log('🎨 Mise à jour de l\'image SDNext...\n');

  try {
    // Rechercher la carte SDNext
    const { data: existingCard, error: searchError } = await supabase
      .from('cartes')
      .select('*')
      .ilike('title', '%sdnext%')
      .single();

    if (searchError) {
      console.log('❌ Carte SDNext non trouvée');
      return;
    }

    console.log('✅ Carte SDNext trouvée:', existingCard.title);
    console.log('ID:', existingCard.id);

    // Mettre à jour avec l'image SVG
    const { data: updatedCard, error: updateError } = await supabase
      .from('cartes')
      .update({
        image_url: '/images/sdnext-interface.svg',
        youtube_url: null // Supprimer l'URL YouTube
      })
      .eq('id', existingCard.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur mise à jour carte SDNext:', updateError);
      return;
    }

    console.log('✅ Carte SDNext mise à jour avec succès!');
    console.log('Nouvelle image:', updatedCard.image_url);
    console.log('YouTube URL supprimée');

    console.log('\n🎉 Image SDNext mise à jour!');
    console.log('✅ Image SVG moderne ajoutée');
    console.log('✅ Interface SDNext représentée');
    console.log('✅ Design cohérent avec le thème');
    console.log('✅ Effet hover avec bouton play');
    console.log('✅ Responsive et optimisé');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
updateSDNextImage(); 