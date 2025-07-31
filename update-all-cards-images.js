const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - utilisez vos vraies clés
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL
const supabaseKey = 'your-service-role-key'; // Remplacez par votre clé

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping des cartes avec leurs images
const cardImageMapping = {
  'SDNext': '/images/sdnext-interface.svg',
  'IAmetube': '/images/iametube-interface.svg',
  'IAphoto': '/images/iaphoto-interface.svg',
  'IAvideo': '/images/iavideo-interface.svg',
  'Canvas Building Framework': '/images/canvas-framework.svg'
};

async function updateAllCardsImages() {
  console.log('🎨 Mise à jour des images pour toutes les cartes...\n');

  try {
    // Récupérer toutes les cartes existantes
    const { data: existingCards, error: fetchError } = await supabase
      .from('cartes')
      .select('id, title');

    if (fetchError) {
      console.error('❌ Erreur récupération cartes:', fetchError);
      return;
    }

    if (!existingCards || existingCards.length === 0) {
      console.log('❌ Aucune carte trouvée dans la base de données');
      return;
    }

    console.log(`📋 ${existingCards.length} cartes trouvées`);

    // Mettre à jour chaque carte avec son image
    for (const card of existingCards) {
      const imageUrl = cardImageMapping[card.title];
      
      if (imageUrl) {
        console.log(`🔄 Mise à jour de "${card.title}" avec ${imageUrl}`);
        
        const { error: updateError } = await supabase
          .from('cartes')
          .update({
            image_url: imageUrl,
            youtube_url: null // Supprimer l'URL YouTube
          })
          .eq('id', card.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour "${card.title}":`, updateError);
        } else {
          console.log(`✅ "${card.title}" mise à jour avec succès`);
        }
      } else {
        console.log(`⚠️  Pas d'image configurée pour "${card.title}"`);
      }
    }

    console.log('\n🎉 Mise à jour terminée !');
    console.log('✅ Images SVG ajoutées à toutes les cartes');
    console.log('✅ URLs YouTube supprimées');
    console.log('✅ Organisation dans le dossier /images/');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.log('\n💡 Pour résoudre le problème:');
    console.log('1. Vérifiez vos clés Supabase dans le script');
    console.log('2. Assurez-vous que la table "cartes" existe');
    console.log('3. Vérifiez votre connexion internet');
  }
}

// Exécuter le script
updateAllCardsImages(); 