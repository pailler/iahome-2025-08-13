const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertTestUserApplications() {
  try {
    console.log('🔍 Vérification et insertion de données de test...');
    
    // Récupérer les utilisateurs existants
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(3);
    
    if (usersError) {
      console.log('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    console.log(`📋 ${users.length} utilisateurs trouvés`);
    
    // Récupérer les modules existants
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title')
      .limit(3);
    
    if (modulesError) {
      console.log('❌ Erreur lors de la récupération des modules:', modulesError.message);
      return;
    }
    
    if (!modules || modules.length === 0) {
      console.log('❌ Aucun module trouvé');
      return;
    }
    
    console.log(`📦 ${modules.length} modules trouvés`);
    
    // Vérifier si la table user_applications existe
    const { data: existingApps, error: tableError } = await supabase
      .from('user_applications')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.log('❌ La table user_applications n\'existe pas encore');
      console.log('💡 Veuillez d\'abord exécuter le script SQL create-user-applications-table.sql');
      return;
    }
    
    // Vérifier les applications existantes
    const { data: currentApps, error: appsError } = await supabase
      .from('user_applications')
      .select('id, user_id, module_id')
      .limit(10);
    
    if (appsError) {
      console.log('❌ Erreur lors de la vérification des applications existantes:', appsError.message);
      return;
    }
    
    console.log(`📱 ${currentApps?.length || 0} applications existantes`);
    
    // Si il y a déjà des applications, ne pas en créer de nouvelles
    if (currentApps && currentApps.length > 0) {
      console.log('✅ Des applications existent déjà, pas besoin d\'en créer de nouvelles');
      return;
    }
    
    // Créer des applications de test
    console.log('🔄 Création d\'applications de test...');
    
    const testApplications = [];
    
    // Créer quelques applications de test
    for (let i = 0; i < Math.min(2, users.length); i++) {
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
    
    // Vérifier les tokens d'accès existants
    const { data: tokens, error: tokensError } = await supabase
      .from('access_tokens')
      .select('id, name, module_id, access_level, is_active')
      .limit(5);
    
    if (tokensError) {
      console.log('❌ Erreur lors de la récupération des tokens:', tokensError.message);
    } else {
      console.log(`🔑 ${tokens?.length || 0} tokens d'accès trouvés`);
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

insertTestUserApplications(); 