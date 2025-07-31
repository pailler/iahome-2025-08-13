const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function enrichSDNextData() {
  console.log('🎨 Enrichissement des données SDNext...\n');

  try {
    // Rechercher la carte SDNext
    const { data: existingCard, error: searchError } = await supabase
      .from('cartes')
      .select('*')
      .ilike('title', '%sdnext%')
      .single();

    if (searchError) {
      console.log('❌ Carte SDNext non trouvée, création...');
      
      // Créer une nouvelle carte SDNext
      const { data: newCard, error: createError } = await supabase
        .from('cartes')
        .insert({
          title: 'SDNext',
          description: 'Interface web moderne et intuitive pour Stable Diffusion, offrant une expérience utilisateur optimisée avec des fonctionnalités avancées de génération d\'images.',
          category: 'BUILDING BLOCKS',
          price: 29.99,
          youtube_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
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
      console.log('Prix: €', newCard.price);

    } else {
      console.log('✅ Carte SDNext trouvée, mise à jour...');
      console.log('ID existant:', existingCard.id);

      // Mettre à jour avec des données enrichies
      const { data: updatedCard, error: updateError } = await supabase
        .from('cartes')
        .update({
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
        .eq('id', existingCard.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erreur mise à jour carte SDNext:', updateError);
        return;
      }

      console.log('✅ Carte SDNext mise à jour avec succès!');
      console.log('Fonctionnalités ajoutées:', updatedCard.features?.length || 0);
      console.log('Prérequis ajoutés:', updatedCard.requirements?.length || 0);
      console.log('Étapes d\'installation:', updatedCard.installation_steps?.length || 0);
      console.log('Exemples d\'utilisation:', updatedCard.usage_examples?.length || 0);
    }

    console.log('\n🎉 Données SDNext enrichies avec succès!');
    console.log('✅ Fonctionnalités détaillées ajoutées');
    console.log('✅ Prérequis techniques spécifiés');
    console.log('✅ Étapes d\'installation claires');
    console.log('✅ Exemples d\'utilisation concrets');
    console.log('✅ Liens vers documentation et ressources');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
enrichSDNextData(); 