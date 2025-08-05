const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndPopulateUserApplications() {
  try {
    console.log('🔍 Vérification de la table user_applications...');
    
    // Vérifier si la table existe
    const { data: tableExists, error: tableError } = await supabase
      .from('user_applications')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.log('❌ La table user_applications n\'existe pas ou n\'est pas accessible');
      console.log('Erreur:', tableError.message);
      return;
    }
    
    console.log('✅ La table user_applications existe');
    
    // Récupérer les utilisateurs existants
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
      return;
    }
    
    console.log(`📋 ${users.length} utilisateurs trouvés`);
    
    // Récupérer les modules existants
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title')
      .limit(5);
    
    if (modulesError) {
      console.log('❌ Erreur lors de la récupération des modules:', modulesError.message);
      return;
    }
    
    console.log(`📦 ${modules.length} modules trouvés`);
    
    // Vérifier les applications existantes
    const { data: existingApps, error: appsError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        access_level,
        is_active,
        created_at,
        profiles!inner(email),
        modules!inner(title)
      `)
      .order('created_at', { ascending: false });
    
    if (appsError) {
      console.log('❌ Erreur lors de la récupération des applications:', appsError.message);
      return;
    }
    
    console.log(`📱 ${existingApps.length} applications utilisateur existantes`);
    
    if (existingApps.length > 0) {
      console.log('\n📊 Applications existantes:');
      existingApps.forEach((app, index) => {
        console.log(`${index + 1}. ${app.profiles.email} → ${app.modules.title} (${app.access_level}) - ${app.is_active ? 'Actif' : 'Inactif'}`);
      });
    }
    
    // Si pas d'applications, en créer quelques-unes de test
    if (existingApps.length === 0 && users.length > 0 && modules.length > 0) {
      console.log('\n🔄 Création d\'applications de test...');
      
      const testApplications = [];
      
      // Créer quelques applications de test
      for (let i = 0; i < Math.min(3, users.length); i++) {
        for (let j = 0; j < Math.min(2, modules.length); j++) {
          testApplications.push({
            user_id: users[i].id,
            module_id: modules[j].id,
            access_level: ['basic', 'premium', 'admin'][Math.floor(Math.random() * 3)],
            is_active: Math.random() > 0.3, // 70% de chance d'être actif
            expires_at: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Expire dans 0-30 jours
          });
        }
      }
      
      const { data: insertedApps, error: insertError } = await supabase
        .from('user_applications')
        .insert(testApplications)
        .select();
      
      if (insertError) {
        console.log('❌ Erreur lors de l\'insertion des applications de test:', insertError.message);
        return;
      }
      
      console.log(`✅ ${insertedApps.length} applications de test créées`);
      
      // Afficher les nouvelles applications
      console.log('\n📊 Nouvelles applications créées:');
      insertedApps.forEach((app, index) => {
        const user = users.find(u => u.id === app.user_id);
        const module = modules.find(m => m.id === app.module_id);
        console.log(`${index + 1}. ${user?.email} → ${module?.title} (${app.access_level}) - ${app.is_active ? 'Actif' : 'Inactif'}`);
      });
    }
    
    // Vérifier les tokens d'accès existants
    const { data: tokens, error: tokensError } = await supabase
      .from('access_tokens')
      .select(`
        id,
        name,
        module_id,
        access_level,
        is_active,
        created_by,
        modules!inner(title),
        profiles!inner(email)
      `)
      .order('created_at', { ascending: false });
    
    if (tokensError) {
      console.log('❌ Erreur lors de la récupération des tokens:', tokensError.message);
    } else {
      console.log(`🔑 ${tokens.length} tokens d'accès trouvés`);
      
      if (tokens.length > 0) {
        console.log('\n🔑 Tokens existants:');
        tokens.forEach((token, index) => {
          console.log(`${index + 1}. ${token.name} (${token.modules.title}) - ${token.profiles.email} - ${token.access_level} - ${token.is_active ? 'Actif' : 'Inactif'}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkAndPopulateUserApplications(); 