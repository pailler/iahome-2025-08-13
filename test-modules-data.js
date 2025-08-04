// Script pour tester la récupération des données des modules
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre configuration)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testModulesData() {
  console.log('🔍 Test de récupération des données des modules...');
  
  try {
    // Test 1: Vérifier la connexion
    console.log('\n📡 Test 1: Vérification de la connexion...');
    const { data: testData, error: testError } = await supabase
      .from('modules')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError);
      return;
    }
    console.log('✅ Connexion réussie');

    // Test 2: Récupérer tous les modules
    console.log('\n📡 Test 2: Récupération de tous les modules...');
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .order('title', { ascending: true });

    if (modulesError) {
      console.error('❌ Erreur lors de la récupération des modules:', modulesError);
      return;
    }

    console.log(`✅ ${modulesData.length} modules récupérés`);
    
    if (modulesData.length === 0) {
      console.log('ℹ️ Aucun module trouvé dans la base de données');
      return;
    }

    // Test 3: Afficher les données de chaque module
    console.log('\n📊 Test 3: Données des modules:');
    modulesData.forEach((module, index) => {
      console.log(`\n--- Module ${index + 1} ---`);
      console.log('ID:', module.id);
      console.log('Titre:', module.title);
      console.log('Sous-titre:', module.subtitle || '(aucun)');
      console.log('Description:', module.description?.substring(0, 50) + '...');
      console.log('Catégorie:', module.category);
      console.log('Prix:', module.price);
      console.log('URL YouTube:', module.youtube_url || '(aucune)');
      console.log('Créé le:', module.created_at);
      console.log('Mis à jour le:', module.updated_at);
    });

    // Test 4: Vérifier les modules avec sous-titres
    console.log('\n📊 Test 4: Modules avec sous-titres:');
    const modulesWithSubtitle = modulesData.filter(m => m.subtitle && m.subtitle.trim() !== '');
    console.log(`${modulesWithSubtitle.length} modules avec sous-titre:`);
    modulesWithSubtitle.forEach(module => {
      console.log(`- ${module.title}: "${module.subtitle}"`);
    });

    // Test 5: Vérifier les modules sans sous-titres
    console.log('\n📊 Test 5: Modules sans sous-titres:');
    const modulesWithoutSubtitle = modulesData.filter(m => !m.subtitle || m.subtitle.trim() === '');
    console.log(`${modulesWithoutSubtitle.length} modules sans sous-titre:`);
    modulesWithoutSubtitle.forEach(module => {
      console.log(`- ${module.title}`);
    });

    // Test 6: Simuler le traitement des données comme dans l'application
    console.log('\n📊 Test 6: Simulation du traitement des données:');
    const processedModules = modulesData.map(module => ({
      id: module.id,
      title: module.title || '',
      description: module.description || '',
      subtitle: module.subtitle || '',
      category: module.category || '',
      price: module.price || 0,
      youtube_url: module.youtube_url || '',
      created_at: module.created_at,
      updated_at: module.updated_at
    }));

    console.log('✅ Données traitées avec succès');
    console.log('Exemple de module traité:', processedModules[0]);

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le test
testModulesData().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur lors du test:', error);
  process.exit(1);
}); 