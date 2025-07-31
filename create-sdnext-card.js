const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - utilisez vos vraies clés
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL
const supabaseKey = 'your-service-role-key'; // Remplacez par votre clé

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSDNextCard() {
  console.log('🎨 Création de la carte SDNext...\n');

  try {
    // Créer la carte SDNext avec l'image SVG
    const { data: newCard, error: createError } = await supabase
      .from('cartes')
      .insert({
        title: 'SDNext',
        description: 'Interface web moderne et intuitive pour Stable Diffusion, offrant une expérience utilisateur optimisée avec des fonctionnalités avancées de génération d\'images.',
        category: 'BUILDING BLOCKS',
        price: 29.99,
        image_url: '/images/sdnext-interface.svg', // Image SVG au lieu de YouTube
        youtube_url: null,
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

    console.log('✅ Carte SDNext créée avec succès!');
    console.log('ID:', newCard.id);
    console.log('Titre:', newCard.title);
    console.log('Image:', newCard.image_url);
    console.log('Prix: €', newCard.price);

    console.log('\n🎉 Carte SDNext créée avec l\'image SVG !');
    console.log('✅ Image SVG moderne ajoutée');
    console.log('✅ Interface SDNext représentée');
    console.log('✅ Données enrichies complètes');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.log('\n💡 Pour résoudre le problème:');
    console.log('1. Vérifiez vos clés Supabase dans le script');
    console.log('2. Assurez-vous que la table "cartes" existe');
    console.log('3. Vérifiez votre connexion internet');
  }
}

// Exécuter le script
createSDNextCard(); 