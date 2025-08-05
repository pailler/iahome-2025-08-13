const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllUserData() {
  const targetEmail = 'formateur_tic@hotmail.com';
  
  try {
    console.log(`🔍 Vérification complète des données pour: ${targetEmail}`);
    
    // 1. Trouver l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('email', targetEmail)
      .single();
    
    if (userError || !user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur: ${user.email} (${user.role}) - ID: ${user.id}`);
    console.log(`📅 Créé le: ${new Date(user.created_at).toLocaleDateString()}`);
    console.log('');
    
    // 2. Vérifier user_applications
    console.log('📱 Vérification de la table user_applications...');
    try {
      const { data: userApps, error: appsError } = await supabase
        .from('user_applications')
        .select(`
          id,
          module_id,
          access_level,
          is_active,
          created_at,
          modules!inner(title)
        `)
        .eq('user_id', user.id);
      
      if (appsError) {
        console.log('❌ Erreur user_applications:', appsError.message);
      } else {
        console.log(`📊 ${userApps?.length || 0} applications dans user_applications`);
        if (userApps && userApps.length > 0) {
          userApps.forEach((app, index) => {
            console.log(`  ${index + 1}. ${app.modules.title} (${app.access_level}) - ${app.is_active ? 'Actif' : 'Inactif'}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Table user_applications non accessible');
    }
    console.log('');
    
    // 3. Vérifier access_tokens
    console.log('🔑 Vérification de la table access_tokens...');
    try {
      const { data: tokens, error: tokensError } = await supabase
        .from('access_tokens')
        .select(`
          id,
          name,
          module_id,
          access_level,
          is_active,
          created_at,
          modules!inner(title)
        `)
        .eq('created_by', user.id);
      
      if (tokensError) {
        console.log('❌ Erreur access_tokens:', tokensError.message);
      } else {
        console.log(`🔑 ${tokens?.length || 0} tokens dans access_tokens`);
        if (tokens && tokens.length > 0) {
          tokens.forEach((token, index) => {
            console.log(`  ${index + 1}. ${token.name} (${token.modules.title}) - ${token.access_level} - ${token.is_active ? 'Actif' : 'Inactif'}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Table access_tokens non accessible');
    }
    console.log('');
    
    // 4. Vérifier les modules disponibles
    console.log('📦 Vérification des modules disponibles...');
    try {
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id, title, category, price')
        .order('title');
      
      if (modulesError) {
        console.log('❌ Erreur modules:', modulesError.message);
      } else {
        console.log(`📦 ${modules?.length || 0} modules disponibles`);
        if (modules && modules.length > 0) {
          modules.forEach((module, index) => {
            console.log(`  ${index + 1}. ${module.title} (${module.category}) - ${module.price}€`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Table modules non accessible');
    }
    console.log('');
    
    // 5. Vérifier s'il y a d'autres tables liées aux utilisateurs
    console.log('🔍 Vérification d\'autres tables possibles...');
    
    // Vérifier s'il y a une table "subscriptions" ou similaire
    const possibleTables = ['subscriptions', 'user_modules', 'user_access', 'applications', 'user_subscriptions'];
    
    for (const tableName of possibleTables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!tableError) {
          console.log(`✅ Table ${tableName} existe`);
          // Essayer de récupérer les données pour cet utilisateur
          const { data: userData, error: userDataError } = await supabase
            .from(tableName)
            .select('*')
            .or(`user_id.eq.${user.id},email.eq.${targetEmail}`);
          
          if (!userDataError && userData && userData.length > 0) {
            console.log(`📊 ${userData.length} entrées trouvées dans ${tableName}`);
          }
        }
      } catch (error) {
        // Table n'existe pas, continuer
      }
    }
    
    console.log('');
    console.log('📋 Résumé:');
    console.log(`- Utilisateur: ${targetEmail}`);
    console.log(`- Rôle: ${user.role}`);
    console.log(`- Applications actives: Vérifiez les tables ci-dessus`);
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkAllUserData(); 