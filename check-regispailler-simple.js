const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRegispaillerSimple() {
  const targetEmail = 'regispailler@gmail.com';
  
  try {
    console.log(`🔍 Vérification simple pour: ${targetEmail}`);
    
    // 1. Trouver l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', targetEmail)
      .single();
    
    if (userError || !user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.email} (${user.role}) - ID: ${user.id}`);
    console.log('');
    
    // 2. Vérifier les accès modules (sans relation)
    console.log('📱 Vérification des accès modules...');
    const { data: moduleAccess, error: maError } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', user.id);
    
    if (maError) {
      console.log('❌ Erreur module_access:', maError.message);
    } else {
      console.log(`📊 ${moduleAccess?.length || 0} accès modules trouvés`);
      
      if (moduleAccess && moduleAccess.length > 0) {
        console.log('\n📋 Accès modules:');
        moduleAccess.forEach((access, index) => {
          console.log(`${index + 1}. Module ID: ${access.module_id}`);
          console.log(`   Type: ${access.access_type}`);
          console.log(`   Créé: ${new Date(access.created_at).toLocaleDateString()}`);
          if (access.expires_at) {
            console.log(`   Expire: ${new Date(access.expires_at).toLocaleDateString()}`);
          }
          console.log('');
        });
      }
    }
    
    // 3. Vérifier les tokens d'accès
    console.log('🔑 Vérification des tokens d\'accès...');
    const { data: tokens, error: tokensError } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('created_by', user.id);
    
    if (tokensError) {
      console.log('❌ Erreur access_tokens:', tokensError.message);
    } else {
      console.log(`🔑 ${tokens?.length || 0} tokens trouvés`);
      
      if (tokens && tokens.length > 0) {
        console.log('\n📋 Tokens d\'accès:');
        tokens.forEach((token, index) => {
          console.log(`${index + 1}. ${token.name}`);
          console.log(`   Module ID: ${token.module_id}`);
          console.log(`   Utilisations: ${token.current_usage || 0} / ${token.max_usage || '∞'}`);
          console.log(`   Statut: ${token.is_active ? 'Actif' : 'Inactif'}`);
          console.log(`   Créé: ${new Date(token.created_at).toLocaleDateString()}`);
          if (token.expires_at) {
            console.log(`   Expire: ${new Date(token.expires_at).toLocaleDateString()}`);
          }
          console.log('');
        });
      }
    }
    
    // 4. Vérifier les modules disponibles
    console.log('📦 Vérification des modules disponibles...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .order('title');
    
    if (modulesError) {
      console.log('❌ Erreur modules:', modulesError.message);
    } else {
      console.log(`📦 ${modules?.length || 0} modules disponibles`);
      
      if (modules && modules.length > 0) {
        console.log('\n📋 Modules disponibles:');
        modules.forEach((module, index) => {
          console.log(`${index + 1}. ${module.title} (${module.category}) - ${module.price}€`);
        });
      }
    }
    
    console.log('\n📋 Résumé:');
    console.log(`- Utilisateur: ${targetEmail}`);
    console.log(`- Accès modules: ${moduleAccess?.length || 0}`);
    console.log(`- Tokens d'accès: ${tokens?.length || 0}`);
    console.log(`- Modules disponibles: ${modules?.length || 0}`);
    
    if (moduleAccess && moduleAccess.length > 0 && tokens && tokens.length === 0) {
      console.log('\n⚠️  ATTENTION: L\'utilisateur a des accès modules mais aucun token !');
      console.log('💡 Il faut créer des tokens pour que les informations s\'affichent sur /encours');
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkRegispaillerSimple(); 