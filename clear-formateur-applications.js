const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearFormateurApplications() {
  const targetEmail = 'formateur_tic@hotmail.com';
  
  try {
    console.log(`🔍 Suppression des applications pour: ${targetEmail}`);
    
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
    
    // Vérifier module_access
    const { data: moduleAccess, error: maError } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', user.id);
    
    if (maError) {
      console.log('❌ Erreur module_access:', maError.message);
    } else {
      console.log(`📱 ${moduleAccess?.length || 0} accès modules trouvés`);
    }
    
    // Vérifier active_applications
    const { data: activeApps, error: aaError } = await supabase
      .from('active_applications')
      .select('*')
      .eq('user_id', user.id);
    
    if (aaError) {
      console.log('❌ Erreur active_applications:', aaError.message);
    } else {
      console.log(`📱 ${activeApps?.length || 0} applications actives trouvées`);
    }
    
    console.log('');
    
    // 3. Demander confirmation
    console.log('⚠️  ATTENTION: Cette action va supprimer TOUTES les applications de cet utilisateur');
    console.log('Pour continuer, modifiez le script et mettez confirmDelete = true');
    
    const confirmDelete = true; // Mettre à true pour confirmer la suppression
    
    if (!confirmDelete) {
      console.log('❌ Suppression annulée. Modifiez confirmDelete = true pour confirmer.');
      return;
    }
    
    // 4. Supprimer les données de module_access
    console.log('\n🗑️  Suppression des accès modules...');
    if (moduleAccess && moduleAccess.length > 0) {
      const { data: deletedMA, error: deleteMAError } = await supabase
        .from('module_access')
        .delete()
        .eq('user_id', user.id)
        .select();
      
      if (deleteMAError) {
        console.log('❌ Erreur lors de la suppression module_access:', deleteMAError.message);
      } else {
        console.log(`✅ ${deletedMA?.length || 0} accès modules supprimés`);
      }
    } else {
      console.log('✅ Aucun accès module à supprimer');
    }
    
    // 5. Supprimer les données de active_applications
    console.log('\n🗑️  Suppression des applications actives...');
    if (activeApps && activeApps.length > 0) {
      const { data: deletedAA, error: deleteAAError } = await supabase
        .from('active_applications')
        .delete()
        .eq('user_id', user.id)
        .select();
      
      if (deleteAAError) {
        console.log('❌ Erreur lors de la suppression active_applications:', deleteAAError.message);
      } else {
        console.log(`✅ ${deletedAA?.length || 0} applications actives supprimées`);
      }
    } else {
      console.log('✅ Aucune application active à supprimer');
    }
    
    // 6. Vérifier que tout a été supprimé
    console.log('\n🔍 Vérification de la suppression...');
    
    const { data: remainingMA, error: checkMAError } = await supabase
      .from('module_access')
      .select('id')
      .eq('user_id', user.id);
    
    const { data: remainingAA, error: checkAAError } = await supabase
      .from('active_applications')
      .select('id')
      .eq('user_id', user.id);
    
    if (checkMAError) {
      console.log('❌ Erreur lors de la vérification module_access:', checkMAError.message);
    } else {
      console.log(`📊 Accès modules restants: ${remainingMA?.length || 0}`);
    }
    
    if (checkAAError) {
      console.log('❌ Erreur lors de la vérification active_applications:', checkAAError.message);
    } else {
      console.log(`📊 Applications actives restantes: ${remainingAA?.length || 0}`);
    }
    
    // 7. Afficher un résumé
    console.log('\n📋 Résumé:');
    console.log(`- Utilisateur: ${targetEmail}`);
    console.log(`- Accès modules supprimés: ${moduleAccess?.length || 0}`);
    console.log(`- Applications actives supprimées: ${activeApps?.length || 0}`);
    console.log(`- Accès modules restants: ${remainingMA?.length || 0}`);
    console.log(`- Applications actives restantes: ${remainingAA?.length || 0}`);
    
    if ((!remainingMA || remainingMA.length === 0) && (!remainingAA || remainingAA.length === 0)) {
      console.log('\n🎉 Toutes les applications ont été supprimées avec succès !');
    } else {
      console.log('\n⚠️  Certaines applications restent encore.');
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

clearFormateurApplications(); 