const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRegispaillerTokens() {
  const targetEmail = 'regispailler@gmail.com';
  
  try {
    console.log(`🔍 Vérification des tokens pour: ${targetEmail}`);
    
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
    
    // 2. Vérifier les accès modules
    console.log('📱 Vérification des accès modules...');
    const { data: moduleAccess, error: maError } = await supabase
      .from('module_access')
      .select(`
        id,
        module_id,
        access_type,
        expires_at,
        created_at,
        modules!inner(title, category, price)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (maError) {
      console.log('❌ Erreur module_access:', maError.message);
    } else {
      console.log(`📊 ${moduleAccess?.length || 0} accès modules trouvés`);
      
      if (moduleAccess && moduleAccess.length > 0) {
        console.log('\n📋 Accès modules:');
        moduleAccess.forEach((access, index) => {
          console.log(`${index + 1}. ${access.modules.title} (${access.modules.category}) - ${access.modules.price}€`);
          console.log(`   Module ID: ${access.module_id}`);
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
      .select(`
        id,
        name,
        module_id,
        max_usage,
        current_usage,
        expires_at,
        last_used_at,
        is_active,
        created_at,
        modules!inner(title, category, price)
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });
    
    if (tokensError) {
      console.log('❌ Erreur access_tokens:', tokensError.message);
    } else {
      console.log(`🔑 ${tokens?.length || 0} tokens trouvés`);
      
      if (tokens && tokens.length > 0) {
        console.log('\n📋 Tokens d\'accès:');
        tokens.forEach((token, index) => {
          console.log(`${index + 1}. ${token.name} (${token.modules.title})`);
          console.log(`   Module ID: ${token.module_id}`);
          console.log(`   Utilisations: ${token.current_usage || 0} / ${token.max_usage || '∞'}`);
          console.log(`   Statut: ${token.is_active ? 'Actif' : 'Inactif'}`);
          console.log(`   Créé: ${new Date(token.created_at).toLocaleDateString()}`);
          if (token.expires_at) {
            console.log(`   Expire: ${new Date(token.expires_at).toLocaleDateString()}`);
          }
          if (token.last_used_at) {
            console.log(`   Dernière utilisation: ${new Date(token.last_used_at).toLocaleDateString()}`);
          }
          console.log('');
        });
      }
    }
    
    // 4. Vérifier les applications actives
    console.log('📱 Vérification des applications actives...');
    const { data: activeApps, error: aaError } = await supabase
      .from('active_applications')
      .select(`
        id,
        module_name,
        module_id,
        status,
        created_at,
        last_activity
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (aaError) {
      console.log('❌ Erreur active_applications:', aaError.message);
    } else {
      console.log(`📱 ${activeApps?.length || 0} applications actives trouvées`);
      
      if (activeApps && activeApps.length > 0) {
        console.log('\n📋 Applications actives:');
        activeApps.forEach((app, index) => {
          console.log(`${index + 1}. ${app.module_name} (${app.status})`);
          console.log(`   Module ID: ${app.module_id}`);
          console.log(`   Créé: ${new Date(app.created_at).toLocaleDateString()}`);
          if (app.last_activity) {
            console.log(`   Dernière activité: ${new Date(app.last_activity).toLocaleDateString()}`);
          }
          console.log('');
        });
      }
    }
    
    console.log('📋 Résumé:');
    console.log(`- Utilisateur: ${targetEmail}`);
    console.log(`- Accès modules: ${moduleAccess?.length || 0}`);
    console.log(`- Tokens d'accès: ${tokens?.length || 0}`);
    console.log(`- Applications actives: ${activeApps?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkRegispaillerTokens(); 