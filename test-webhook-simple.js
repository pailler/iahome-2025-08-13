require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWebhookSimple() {
  console.log('🧪 Test simple du webhook (sans signature)');
  
  try {
    // 1. Récupérer l'utilisateur et un module
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'formateur_tic@hotmail.com')
      .single();
    
    if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError);
      return;
    }
    
    const { data: modules, error: modulesError } = await supabase
      .from('cartes')
      .select('id, title, price')
      .limit(1);
    
    if (modulesError || !modules.length) {
      console.error('❌ Erreur récupération modules:', modulesError);
      return;
    }
    
    const module = modules[0];
    console.log('✅ Utilisateur:', user.email);
    console.log('✅ Module:', module.title);
    
    // 2. Compter les accès avant
    const { data: beforeAccess, error: beforeError } = await supabase
      .from('module_access')
      .select('id')
      .eq('user_id', user.id);
    
    if (beforeError) {
      console.error('❌ Erreur comptage accès:', beforeError);
      return;
    }
    
    console.log('📊 Accès avant test:', beforeAccess.length);
    
    // 3. Tester directement la fonction addModuleAccess
    console.log('🔧 Test direct de addModuleAccess...');
    
    // Simuler l'ajout d'un accès
    const { data: newAccess, error: accessError } = await supabase
      .from('module_access')
      .insert({
        user_id: user.id,
        module_id: module.id,
        access_type: 'purchase',
        metadata: {
          session_id: 'test_session_' + Date.now(),
          purchased_at: new Date().toISOString(),
          test: true
        }
      })
      .select();
    
    if (accessError) {
      console.error('❌ Erreur ajout accès:', accessError);
      return;
    }
    
    console.log('✅ Nouvel accès ajouté:', newAccess[0].id);
    
    // 4. Vérifier les accès après
    const { data: afterAccess, error: afterError } = await supabase
      .from('module_access')
      .select('id, created_at, metadata')
      .eq('user_id', user.id);
    
    if (afterError) {
      console.error('❌ Erreur vérification après:', afterError);
      return;
    }
    
    console.log('📊 Accès après test:', afterAccess.length);
    
    // 5. Afficher les nouveaux accès
    const newAccesses = afterAccess.slice(beforeAccess.length);
    if (newAccesses.length > 0) {
      console.log('✅ Nouveaux accès créés:');
      newAccesses.forEach(acc => {
        console.log(`   - ${acc.id} (${acc.created_at})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testWebhookSimple(); 