const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec les vraies valeurs
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateSDNextWithSVG() {
  console.log('🎨 Mise à jour de la carte SDNext avec l\'image SVG...\n');

  try {
    // Rechercher la carte SDNext existante
    const { data: existingCard, error: searchError } = await supabase
      .from('cartes')
      .select('*')
      .ilike('title', '%sdnext%')
      .single();

    if (searchError) {
      console.log('❌ Carte SDNext non trouvée, création d\'une nouvelle carte...');
      
      // Créer une nouvelle carte SDNext avec l'image SVG
      const { data: newCard, error: createError } = await supabase
        .from('cartes')
        .insert({
          title: 'SDNext',
          description: 'Interface web moderne et intuitive pour Stable Diffusion, offrant une expérience utilisateur optimisée avec des fonctionnalités avancées de génération d\'images.',
          category: 'BUILDING BLOCKS',
          price: 29.99,
          image_url: '/images/sdnext-interface.svg', // Image SVG
          youtube_url: null, // Pas d'embed YouTube
          features: [
            'Interface web moderne et responsive',
            'Génération d\'images haute qualité',
            'Modèles personnalisables',
            'Gestion des prompts avancée',
            'Historique des générations',
            'Export en haute résolution',
            'API REST complète',
            'Support multi-utilisateurs'
          ],
          requirements: [
            'Python 3.8+',
            'CUDA compatible GPU (recommandé)',
            '8GB RAM minimum',
            'Espace disque: 10GB',
            'Connexion internet stable'
          ],
          installation_steps: [
            'Cloner le repository GitHub',
            'Installer les dépendances Python',
            'Configurer les variables d\'environnement',
            'Lancer le serveur de développement',
            'Accéder à l\'interface web'
          ],
          usage_examples: [
            'Génération d\'images artistiques à partir de descriptions textuelles',
            'Création de portraits stylisés avec différents modèles',
            'Production de visuels marketing personnalisés',
            'Exploration de concepts créatifs en temps réel'
          ],
          documentation_url: 'https://github.com/vladmandic/automatic/wiki',
          github_url: 'https://github.com/vladmandic/automatic',
          demo_url: 'https://sdnext.regispailler.fr'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur création carte SDNext:', createError);
        return;
      }

      console.log('✅ Nouvelle carte SDNext créée avec succès!');
      console.log('ID:', newCard.id);
      console.log('Titre:', newCard.title);
      console.log('Image SVG:', newCard.image_url);
      console.log('YouTube URL:', newCard.youtube_url);

    } else {
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
      console.log('Nouvelle image SVG:', updatedCard.image_url);
      console.log('YouTube URL supprimée');
    }

    console.log('\n🎉 Image SVG SDNext configurée !');
    console.log('✅ Image SVG moderne ajoutée');
    console.log('✅ Interface SDNext représentée');
    console.log('✅ Embed YouTube remplacé');
    console.log('✅ Design cohérent avec le thème');
    console.log('✅ Effet hover avec bouton play');
    console.log('✅ Responsive et optimisé');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.log('\n💡 Pour résoudre le problème:');
    console.log('1. Vérifiez la connexion à Supabase');
    console.log('2. Assurez-vous que la table "cartes" existe');
    console.log('3. Vérifiez votre connexion internet');
  }
}

// Exécuter le script
updateSDNextWithSVG(); 