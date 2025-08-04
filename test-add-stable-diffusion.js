// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAddStableDiffusion() {
  console.log('🔍 Test d\'ajout du module Stable Diffusion');
  
  const userEmail = 'formateur_tic@hotmail.com';
  const moduleTitle = 'Stable diffusion';
  const sessionId = 'test_session_' + Date.now();
  
  try {
    // 1. Vérifier si le module Stable Diffusion existe
    console.log('\n1️⃣ Vérification du module Stable Diffusion...');
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('title', moduleTitle)
      .single();
    
    if (moduleError || !moduleData) {
      console.error('❌ Module non trouvé:', moduleTitle);
      return;
    }
    
    console.log('✅ Module trouvé:', {
      id: moduleData.id,
      title: moduleData.title,
      price: moduleData.price
    });
    
    // 2. Récupérer l'utilisateur par email (approche alternative)
    console.log('\n2️⃣ Récupération de l\'utilisateur...');
    let { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (userError || !userData) {
      console.error('❌ Utilisateur non trouvé:', userEmail);
      console.log('Tentative avec une approche différente...');
      
      // Essayer de récupérer depuis une table profiles si elle existe
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();
      
      if (profileError || !profileData) {
        console.error('❌ Utilisateur non trouvé dans profiles non plus');
        return;
      }
      
      console.log('✅ Utilisateur trouvé via profiles:', profileData.id);
      userData = profileData;
    } else {
      console.log('✅ Utilisateur trouvé:', userData.id);
    }
    
    // 3. Vérifier si l'accès existe déjà
    console.log('\n3️⃣ Vérification des accès existants...');
    const { data: existingAccess, error: checkError } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', userData.id)
      .eq('module_id', moduleData.id);
    
    if (checkError) {
      console.error('❌ Erreur vérification accès:', checkError);
      return;
    }
    
    console.log('📊 Accès existants:', existingAccess?.length || 0);
    
    if (existingAccess && existingAccess.length > 0) {
      console.log('✅ L\'utilisateur a déjà accès à Stable Diffusion');
      return;
    }
    
    // 4. Ajouter l'accès au module
    console.log('\n4️⃣ Ajout de l\'accès au module...');
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .insert({
        user_id: userData.id,
        module_id: moduleData.id,
        access_type: 'purchase',
        metadata: {
          session_id: sessionId,
          purchased_at: new Date().toISOString(),
          test: true
        }
      })
      .select()
      .single();
    
    if (accessError) {
      console.error('❌ Erreur création accès:', accessError);
      return;
    }
    
    console.log('✅ Accès créé:', accessData.id);
    
    // 5. Vérifier que l'accès apparaît dans la page encours
    console.log('\n5️⃣ Vérification de l\'apparition dans /encours...');
    const { data: encoursData, error: encoursError } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', userData.id);
    
    if (encoursError) {
      console.error('❌ Erreur récupération /encours:', encoursError);
      return;
    }
    
    console.log('📊 Modules dans /encours:', encoursData?.length || 0);
    encoursData?.forEach((access, index) => {
      console.log(`  ${index + 1}. Module ID: ${access.module_id}, Type: ${access.access_type}`);
    });
    
    // 6. Récupérer les détails des modules
    console.log('\n6️⃣ Détails des modules...');
    for (const access of encoursData || []) {
      const { data: moduleDetails, error: moduleDetailsError } = await supabase
        .from('modules')
        .select('title, price')
        .eq('id', access.module_id)
        .single();
      
      if (moduleDetailsError) {
        console.log(`  ❌ Module ${access.module_id}: Erreur - ${moduleDetailsError.message}`);
      } else {
        console.log(`  ✅ Module ${access.module_id}: ${moduleDetails.title} (€${moduleDetails.price})`);
      }
    }
    
    console.log('\n🎉 Test terminé avec succès !');
    console.log('L\'utilisateur formateur_tic@hotmail.com a maintenant accès à Stable Diffusion');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testAddStableDiffusion(); 