require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addStableDiffusionAccess() {
  console.log('🔍 Ajout manuel de l\'accès Stable Diffusion pour regispailler@gmail.com');
  
  try {
    // 1. Récupérer l'utilisateur
    console.log('\n1️⃣ Récupération de l\'utilisateur...');
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'regispailler@gmail.com')
      .single();

    if (userError || !userData) {
      console.error('❌ Utilisateur non trouvé:', userError);
      return;
    }

    console.log('✅ Utilisateur trouvé:', userData);

    // 2. Récupérer le module Stable Diffusion
    console.log('\n2️⃣ Récupération du module Stable Diffusion...');
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, price')
      .eq('title', 'Stable diffusion')
      .single();

    if (moduleError || !moduleData) {
      console.error('❌ Module Stable Diffusion non trouvé:', moduleError);
      return;
    }

    console.log('✅ Module trouvé:', moduleData);

    // 3. Vérifier si l'accès existe déjà
    console.log('\n3️⃣ Vérification d\'accès existant...');
    const { data: existingAccess, error: checkError } = await supabase
      .from('module_access')
      .select('id, created_at')
      .eq('user_id', userData.id)
      .eq('module_id', moduleData.id)
      .single();

    if (existingAccess) {
      console.log('✅ Accès déjà existant:', existingAccess);
      return;
    }

    // 4. Créer l'accès module
    console.log('\n4️⃣ Création de l\'accès module...');
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .insert({
        user_id: userData.id,
        module_id: moduleData.id,
        access_type: 'purchase',
        metadata: {
          session_id: 'manual-access-' + Date.now(),
          purchased_at: new Date().toISOString(),
          added_manually: true
        }
      })
      .select()
      .single();

    if (accessError) {
      console.error('❌ Erreur création accès:', accessError);
      return;
    }

    console.log('✅ Accès créé avec succès:', accessData);

    // 5. Vérifier que l'accès a bien été créé
    console.log('\n5️⃣ Vérification finale...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', userData.id);

    if (finalError) {
      console.error('❌ Erreur vérification finale:', finalError);
      return;
    }

    console.log('📊 Accès totaux pour l\'utilisateur:', finalCheck?.length || 0);
    
    if (finalCheck && finalCheck.length > 0) {
      for (const access of finalCheck) {
        console.log('  - Module ID:', access.module_id, 'Type:', access.access_type, 'Créé:', access.created_at);
      }
    }

    console.log('\n🎉 **Accès Stable Diffusion ajouté avec succès !**');
    console.log('L\'utilisateur regispailler@gmail.com peut maintenant accéder à Stable Diffusion dans la page /encours');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

addStableDiffusionAccess(); 