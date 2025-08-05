const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearFormateurApplicationsComplete() {
  const targetEmail = 'formateur_tic@hotmail.com';
  
  try {
    console.log(`🔍 Suppression complète des applications pour: ${targetEmail}`);
    
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
    
    // 2. Vérifier les données actuelles
    console.log('📊 Vérification des données actuelles...');
    
    // Vérifier active_applications
    const { data: activeApps, error: aaError } = await supabase
      .from('active_applications')
      .select('id, module_name, status, created_at')
      .eq('user_id', user.id);
    
    if (aaError) {
      console.log('❌ Erreur active_applications:', aaError.message);
      return;
    }
    
    console.log(`📱 ${activeApps?.length || 0} applications actives trouvées`);
    
    if (!activeApps || activeApps.length === 0) {
      console.log('✅ Aucune application à supprimer');
      return;
    }
    
    // Afficher les applications trouvées
    console.log('\n📋 Applications trouvées:');
    activeApps.forEach((app, index) => {
      console.log(`${index + 1}. ${app.module_name} (${app.status}) - Créé le ${new Date(app.created_at).toLocaleDateString()}`);
    });
    
    console.log('');
    
    // 3. Demander confirmation
    console.log('⚠️  ATTENTION: Cette action va supprimer TOUTES les applications de cet utilisateur');
    console.log('Pour continuer, modifiez le script et mettez confirmDelete = true');
    
    const confirmDelete = true; // Mettre à true pour confirmer la suppression
    
    if (!confirmDelete) {
      console.log('❌ Suppression annulée. Modifiez confirmDelete = true pour confirmer.');
      return;
    }
    
    // 4. Supprimer les logs d'accès d'abord
    console.log('\n🗑️  Suppression des logs d\'accès...');
    
    const appIds = activeApps.map(app => app.id);
    console.log(`📊 Suppression des logs pour ${appIds.length} applications...`);
    
    // Supprimer les logs d'accès liés à ces applications
    const { data: deletedLogs, error: deleteLogsError } = await supabase
      .from('application_access_logs')
      .delete()
      .in('application_id', appIds)
      .select();
    
    if (deleteLogsError) {
      console.log('❌ Erreur lors de la suppression des logs:', deleteLogsError.message);
      console.log('💡 Tentative de suppression directe des applications...');
    } else {
      console.log(`✅ ${deletedLogs?.length || 0} logs d'accès supprimés`);
    }
    
    // 5. Supprimer les applications actives
    console.log('\n🗑️  Suppression des applications actives...');
    
    const { data: deletedApps, error: deleteAppsError } = await supabase
      .from('active_applications')
      .delete()
      .eq('user_id', user.id)
      .select();
    
    if (deleteAppsError) {
      console.log('❌ Erreur lors de la suppression des applications:', deleteAppsError.message);
      
      // Essayer une suppression une par une
      console.log('🔄 Tentative de suppression une par une...');
      let successCount = 0;
      let errorCount = 0;
      
      for (const app of activeApps) {
        try {
          const { error: singleDeleteError } = await supabase
            .from('active_applications')
            .delete()
            .eq('id', app.id);
          
          if (singleDeleteError) {
            console.log(`❌ Erreur pour l'application ${app.id}:`, singleDeleteError.message);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.log(`❌ Erreur pour l'application ${app.id}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`📊 Suppression une par une: ${successCount} réussies, ${errorCount} échecs`);
    } else {
      console.log(`✅ ${deletedApps?.length || 0} applications actives supprimées`);
    }
    
    // 6. Vérifier que tout a été supprimé
    console.log('\n🔍 Vérification de la suppression...');
    
    const { data: remainingApps, error: checkError } = await supabase
      .from('active_applications')
      .select('id')
      .eq('user_id', user.id);
    
    if (checkError) {
      console.log('❌ Erreur lors de la vérification:', checkError.message);
    } else {
      console.log(`📊 Applications restantes: ${remainingApps?.length || 0}`);
    }
    
    // 7. Afficher un résumé
    console.log('\n📋 Résumé:');
    console.log(`- Utilisateur: ${targetEmail}`);
    console.log(`- Applications trouvées: ${activeApps?.length || 0}`);
    console.log(`- Applications restantes: ${remainingApps?.length || 0}`);
    
    if (!remainingApps || remainingApps.length === 0) {
      console.log('\n🎉 Toutes les applications ont été supprimées avec succès !');
    } else {
      console.log('\n⚠️  Certaines applications restent encore.');
      console.log('💡 Il peut y avoir des contraintes de clé étrangère supplémentaires.');
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

clearFormateurApplicationsComplete(); 