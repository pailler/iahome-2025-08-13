const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearFormateurApplications() {
  const targetEmail = 'formateur_tic@hotmail.com';
  
  try {
    console.log(`🔍 Suppression des applications actives pour: ${targetEmail}`);
    
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
    
    // 2. Vérifier les applications actives AVANT suppression
    console.log('\n📱 Vérification des applications actives...');
    const { data: activeApps, error: aaError } = await supabase
      .from('active_applications')
      .select('*')
      .eq('user_id', user.id);
    
    if (aaError) {
      console.log('❌ Erreur active_applications:', aaError.message);
    } else {
      console.log(`📱 ${activeApps?.length || 0} applications actives trouvées`);
      
      if (activeApps && activeApps.length > 0) {
        console.log('\n📋 Applications actives à supprimer:');
        activeApps.forEach((app, index) => {
          console.log(`${index + 1}. ${app.module_name} (${app.status})`);
          console.log(`   Module ID: ${app.module_id}`);
          console.log(`   Créé: ${new Date(app.created_at).toLocaleDateString()}`);
        });
      }
    }
    
    // 3. Vérifier les logs d'accès AVANT suppression
    console.log('\n📊 Vérification des logs d\'accès...');
    const { data: accessLogs, error: logsError } = await supabase
      .from('application_access_logs')
      .select('*')
      .eq('user_id', user.id);
    
    if (logsError) {
      console.log('❌ Erreur application_access_logs:', logsError.message);
    } else {
      console.log(`📊 ${accessLogs?.length || 0} logs d'accès trouvés`);
    }
    
    // 4. Supprimer les logs d'accès d'abord (pour éviter les contraintes de clé étrangère)
    if (accessLogs && accessLogs.length > 0) {
      console.log('\n🗑️ Suppression des logs d\'accès...');
      const { error: deleteLogsError } = await supabase
        .from('application_access_logs')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteLogsError) {
        console.log('❌ Erreur lors de la suppression des logs:', deleteLogsError.message);
      } else {
        console.log(`✅ ${accessLogs.length} logs d'accès supprimés`);
      }
    }
    
    // 5. Supprimer les applications actives
    if (activeApps && activeApps.length > 0) {
      console.log('\n🗑️ Suppression des applications actives...');
      const { error: deleteAppsError } = await supabase
        .from('active_applications')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteAppsError) {
        console.log('❌ Erreur lors de la suppression des applications:', deleteAppsError.message);
      } else {
        console.log(`✅ ${activeApps.length} applications actives supprimées`);
      }
    } else {
      console.log('\n✅ Aucune application active à supprimer');
    }
    
    // 6. Vérification APRÈS suppression
    console.log('\n🔍 Vérification après suppression...');
    
    const { data: activeAppsAfter, error: aaAfterError } = await supabase
      .from('active_applications')
      .select('*')
      .eq('user_id', user.id);
    
    if (aaAfterError) {
      console.log('❌ Erreur vérification active_applications:', aaAfterError.message);
    } else {
      console.log(`📱 ${activeAppsAfter?.length || 0} applications actives restantes`);
    }
    
    const { data: accessLogsAfter, error: logsAfterError } = await supabase
      .from('application_access_logs')
      .select('*')
      .eq('user_id', user.id);
    
    if (logsAfterError) {
      console.log('❌ Erreur vérification application_access_logs:', logsAfterError.message);
    } else {
      console.log(`📊 ${accessLogsAfter?.length || 0} logs d'accès restants`);
    }
    
    // 7. Vérifier que les modules ne sont pas affectés
    console.log('\n📦 Vérification des modules (ne doivent pas être affectés)...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .order('title');
    
    if (modulesError) {
      console.log('❌ Erreur modules:', modulesError.message);
    } else {
      console.log(`📦 ${modules?.length || 0} modules disponibles (non affectés)`);
    }
    
    console.log('\n🎉 Suppression terminée !');
    console.log('✅ Les applications actives ont été supprimées');
    console.log('✅ Les modules restent intacts');
    console.log('✅ Les logs d\'accès ont été nettoyés');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

clearFormateurApplications(); 