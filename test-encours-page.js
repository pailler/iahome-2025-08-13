// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEncoursPage() {
  console.log('🔍 Test de la logique de la page encours');
  
  const userEmail = 'formateur_tic@hotmail.com';
  const userId = 'ebaace8e-caa6-4a77-b87c-fe66852cb9cc';
  
  try {
    // 1. Simuler la récupération des accès modules (comme dans la page encours)
    console.log('\n1️⃣ Récupération des accès modules...');
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .select(`
        id,
        created_at,
        access_type,
        expires_at,
        metadata,
        module_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (accessError) {
      console.error('❌ Erreur chargement accès modules:', accessError);
      return;
    }

    console.log('📊 Accès modules trouvés:', accessData?.length || 0);
    accessData?.forEach((access, index) => {
      console.log(`  ${index + 1}. Module ID: ${access.module_id}, Type: ${access.access_type}, Créé: ${access.created_at}`);
    });

    if (!accessData || accessData.length === 0) {
      console.log('❌ Aucun accès module trouvé pour cet utilisateur');
      return;
    }

    // 2. Récupérer les détails des modules (comme dans la page encours)
    console.log('\n2️⃣ Récupération des détails des modules...');
    const modulesWithDetails = [];
    
    for (const access of accessData) {
      try {
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('id, title, description, category, price')
          .eq('id', access.module_id)
          .single();

        if (moduleError) {
          console.error(`❌ Erreur chargement module ${access.module_id}:`, moduleError);
          modulesWithDetails.push({
            ...access,
            modules: {
              id: access.module_id,
              title: 'Module supprimé',
              description: 'Ce module n\'existe plus dans la base de données',
              category: 'INCONNU',
              price: '0'
            }
          });
          continue;
        }

        if (moduleData) {
          console.log(`✅ Module ${access.module_id}: ${moduleData.title} (€${moduleData.price})`);
          modulesWithDetails.push({
            ...access,
            modules: moduleData
          });
        }
      } catch (error) {
        console.error(`❌ Exception lors du chargement du module ${access.module_id}:`, error);
        modulesWithDetails.push({
          ...access,
          modules: {
            id: access.module_id,
            title: 'Module supprimé',
            description: 'Ce module n\'existe plus dans la base de données',
            category: 'INCONNU',
            price: '0'
          }
        });
      }
    }

    // 3. Afficher le résultat final
    console.log('\n3️⃣ Résultat final (ce qui devrait s\'afficher sur la page encours):');
    console.log('📊 Modules avec détails:', modulesWithDetails.length);
    
    modulesWithDetails.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.modules.title}`);
      console.log(`   - ID: ${item.modules.id}`);
      console.log(`   - Prix: €${item.modules.price}`);
      console.log(`   - Catégorie: ${item.modules.category}`);
      console.log(`   - Type d'accès: ${item.access_type}`);
      console.log(`   - Créé le: ${item.created_at}`);
    });

    // 4. Vérifier les URLs des modules
    console.log('\n4️⃣ URLs des modules:');
    const moduleUrls = {
      'Stable diffusion': 'https://stablediffusion.regispailler.fr',
      'Metube': 'https://metube.regispailler.fr',
      'PDF+': 'https://pdfplus.regispailler.fr',
      'PSitransfer': 'https://psitransfer.regispailler.fr',
      'Librespeed': 'https://librespeed.regispailler.fr'
    };

    modulesWithDetails.forEach(item => {
      const url = moduleUrls[item.modules.title];
      if (url) {
        console.log(`   ${item.modules.title}: ${url}`);
      } else {
        console.log(`   ${item.modules.title}: URL non définie`);
      }
    });

    console.log('\n🎉 Test terminé !');
    console.log('Si des modules sont affichés ci-dessus, ils devraient apparaître sur la page /encours');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testEncoursPage(); 