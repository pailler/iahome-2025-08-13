require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAccessAfterTest() {
  console.log('🔍 Vérification des accès après test du webhook...');
  
  // 1. Vérifier l'utilisateur
  console.log('\n📋 Vérification de l\'utilisateur...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'regispailler@gmail.com')
    .single();
    
  if (profilesError || !profiles) {
    console.error('❌ Utilisateur non trouvé:', profilesError);
    return;
  }
  
  console.log('✅ Utilisateur trouvé:', profiles.id);
  
  // 2. Vérifier tous les accès de cet utilisateur
  console.log('\n📋 Accès modules de l\'utilisateur:');
  const { data: moduleAccess, error: accessError } = await supabase
    .from('module_access')
    .select('id, module_id, access_type, created_at')
    .eq('user_id', profiles.id)
    .order('created_at', { ascending: false });
    
  if (accessError) {
    console.error('❌ Erreur récupération accès:', accessError);
    return;
  }
  
  console.log('✅ Accès trouvés:', moduleAccess.length);
  moduleAccess.forEach((access, index) => {
    console.log(`  ${index + 1}. Module ID: ${access.module_id}, Type: ${access.access_type}, Créé: ${new Date(access.created_at).toLocaleString()}`);
  });
  
  // 3. Vérifier spécifiquement les modules Stable Diffusion et Cogstudio
  console.log('\n📋 Vérification des modules spécifiques:');
  
  const modulesToCheck = [15, 6]; // Stable Diffusion et Cogstudio
  
  for (const moduleId of modulesToCheck) {
    const { data: access, error: checkError } = await supabase
      .from('module_access')
      .select('id, created_at')
      .eq('user_id', profiles.id)
      .eq('module_id', moduleId)
      .single();
      
    if (access) {
      console.log(`✅ Module ${moduleId}: Accès créé le ${new Date(access.created_at).toLocaleString()}`);
    } else {
      console.log(`❌ Module ${moduleId}: Aucun accès trouvé`);
    }
  }
  
  // 4. Vérifier les modules dans la base de données
  console.log('\n📋 Modules disponibles:');
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('id, title, price')
    .in('id', modulesToCheck)
    .order('id');
    
  if (modulesError) {
    console.error('❌ Erreur récupération modules:', modulesError);
  } else {
    modules.forEach(module => {
      console.log(`  - ID: ${module.id}, Titre: ${module.title}, Prix: ${module.price}`);
    });
  }
  
  // 5. Analyser les résultats
  console.log('\n🔍 Analyse des résultats:');
  
  const stableDiffusionAccess = moduleAccess.find(access => access.module_id === 15);
  const cogstudioAccess = moduleAccess.find(access => access.module_id === 6);
  
  if (stableDiffusionAccess) {
    console.log('✅ Stable Diffusion: Accès existant');
  } else {
    console.log('❌ Stable Diffusion: Accès manquant');
  }
  
  if (cogstudioAccess) {
    console.log('✅ Cogstudio: Accès existant');
  } else {
    console.log('❌ Cogstudio: Accès manquant');
  }
  
  // 6. Recommandations
  console.log('\n📋 Recommandations:');
  
  if (!stableDiffusionAccess || !cogstudioAccess) {
    console.log('1. Le webhook ne crée pas les accès modules automatiquement');
    console.log('2. Vérifier les logs du serveur Next.js pour voir les erreurs');
    console.log('3. Vérifier les permissions Supabase sur la table module_access');
    console.log('4. Tester avec un nouveau paiement en mode test');
  } else {
    console.log('✅ Tous les accès sont présents - le webhook fonctionne correctement');
  }
  
  console.log('\n🔍 Vérification terminée');
}

checkAccessAfterTest().catch(console.error); 