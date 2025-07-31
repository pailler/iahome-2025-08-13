require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAddModuleAccess() {
  console.log('🧪 Test d\'ajout manuel d\'un accès module');
  
  try {
    // 1. Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'formateur_tic@hotmail.com')
      .single();
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', user.email, user.id);
    
    // 2. Récupérer un module disponible
    const { data: modules, error: modulesError } = await supabase
      .from('cartes')
      .select('id, title, price')
      .limit(1);
    
    if (modulesError || !modules.length) {
      console.error('❌ Erreur récupération modules:', modulesError);
      return;
    }
    
    const module = modules[0];
    console.log('✅ Module trouvé:', module.title, module.id);
    
    // 3. Ajouter l'accès manuellement
    const { data: access, error: accessError } = await supabase
      .from('module_access')
      .insert({
        user_id: user.id,
        module_id: module.id,
        access_type: 'purchase',
        metadata: { test: true, manual: true }
      })
      .select();
    
    if (accessError) {
      console.error('❌ Erreur ajout accès:', accessError);
      return;
    }
    
    console.log('✅ Accès ajouté avec succès:', access[0].id);
    
    // 4. Vérifier que l'accès existe
    const { data: verifyAccess, error: verifyError } = await supabase
      .from('module_access')
      .select(`
        id,
        access_type,
        created_at,
        profiles!inner(email),
        cartes!inner(title)
      `)
      .eq('user_id', user.id);
    
    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError);
      return;
    }
    
    console.log('📋 Accès vérifiés:', verifyAccess.length);
    verifyAccess.forEach(acc => {
      console.log(`   - ${acc.cartes.title} (${acc.access_type})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testAddModuleAccess(); 