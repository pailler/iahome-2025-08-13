const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearUserApplications() {
  const targetEmail = 'formateur_tic@hotmail.com';
  
  try {
    console.log(`🔍 Recherche de l'utilisateur: ${targetEmail}`);
    
    // 1. Trouver l'utilisateur par email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', targetEmail)
      .single();
    
    if (userError) {
      console.log('❌ Erreur lors de la recherche de l\'utilisateur:', userError.message);
      return;
    }
    
    if (!user) {
      console.log(`❌ Utilisateur ${targetEmail} non trouvé`);
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})`);
    
    // 2. Vérifier si la table user_applications existe
    const { data: tableExists, error: tableError } = await supabase
      .from('user_applications')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.log('❌ La table user_applications n\'existe pas');
      console.log('💡 Aucune application à supprimer');
      return;
    }
    
    console.log('✅ Table user_applications existe');
    
    // 3. Récupérer les applications actuelles de l'utilisateur
    const { data: currentApps, error: appsError } = await supabase
      .from('user_applications')
      .select(`
        id,
        user_id,
        module_id,
        access_level,
        is_active,
        created_at,
        modules!inner(title)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (appsError) {
      console.log('❌ Erreur lors de la récupération des applications:', appsError.message);
      return;
    }
    
    console.log(`📱 ${currentApps?.length || 0} applications trouvées pour ${targetEmail}`);
    
    if (!currentApps || currentApps.length === 0) {
      console.log('✅ Aucune application à supprimer');
      return;
    }
    
    // 4. Afficher les applications actuelles
    console.log('\n📊 Applications actuelles:');
    currentApps.forEach((app, index) => {
      console.log(`${index + 1}. ${app.modules.title} (${app.access_level}) - ${app.is_active ? 'Actif' : 'Inactif'} - Créé le ${new Date(app.created_at).toLocaleDateString()}`);
    });
    
    // 5. Demander confirmation
    console.log('\n⚠️  ATTENTION: Cette action va supprimer TOUTES les applications de cet utilisateur');
    console.log('Pour continuer, modifiez le script et mettez confirmDelete = true');
    
    const confirmDelete = false; // Mettre à true pour confirmer la suppression
    
    if (!confirmDelete) {
      console.log('❌ Suppression annulée. Modifiez confirmDelete = true pour confirmer.');
      return;
    }
    
    // 6. Supprimer toutes les applications de l'utilisateur
    console.log('\n🗑️  Suppression des applications...');
    
    const { data: deletedApps, error: deleteError } = await supabase
      .from('user_applications')
      .delete()
      .eq('user_id', user.id)
      .select();
    
    if (deleteError) {
      console.log('❌ Erreur lors de la suppression:', deleteError.message);
      return;
    }
    
    console.log(`✅ ${deletedApps?.length || 0} applications supprimées avec succès`);
    
    // 7. Vérifier que les applications ont bien été supprimées
    const { data: remainingApps, error: checkError } = await supabase
      .from('user_applications')
      .select('id')
      .eq('user_id', user.id);
    
    if (checkError) {
      console.log('❌ Erreur lors de la vérification:', checkError.message);
      return;
    }
    
    if (!remainingApps || remainingApps.length === 0) {
      console.log('✅ Vérification réussie: Aucune application restante');
    } else {
      console.log(`⚠️  Attention: ${remainingApps.length} applications restent encore`);
    }
    
    // 8. Afficher un résumé
    console.log('\n📋 Résumé:');
    console.log(`- Utilisateur: ${targetEmail}`);
    console.log(`- Applications supprimées: ${deletedApps?.length || 0}`);
    console.log(`- Applications restantes: ${remainingApps?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

clearUserApplications(); 