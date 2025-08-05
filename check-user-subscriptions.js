const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndClearUserSubscriptions() {
  const targetEmail = 'formateur_tic@hotmail.com';
  
  try {
    console.log(`🔍 Vérification des abonnements pour: ${targetEmail}`);
    
    // 1. Trouver l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', targetEmail)
      .single();
    
    if (userError || !user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.email} (ID: ${user.id})`);
    
    // 2. Vérifier la structure de la table user_subscriptions
    console.log('\n📋 Vérification de la structure de user_subscriptions...');
    try {
      const { data: sampleData, error: sampleError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.log('❌ Erreur lors de l\'accès à user_subscriptions:', sampleError.message);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log('📊 Colonnes disponibles:', Object.keys(sampleData[0]));
      }
    } catch (error) {
      console.log('❌ Impossible d\'accéder à user_subscriptions');
      return;
    }
    
    // 3. Récupérer les abonnements de l'utilisateur
    console.log('\n📱 Récupération des abonnements...');
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id);
    
    if (subsError) {
      console.log('❌ Erreur lors de la récupération des abonnements:', subsError.message);
      return;
    }
    
    console.log(`📊 ${subscriptions?.length || 0} abonnements trouvés`);
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('✅ Aucun abonnement à supprimer');
      return;
    }
    
    // 4. Afficher les abonnements actuels
    console.log('\n📋 Abonnements actuels:');
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ID: ${sub.id}`);
      console.log(`   Module: ${sub.module_id || 'N/A'}`);
      console.log(`   Type: ${sub.type || 'N/A'}`);
      console.log(`   Statut: ${sub.status || 'N/A'}`);
      console.log(`   Créé le: ${sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}`);
      console.log('');
    });
    
    // 5. Demander confirmation
    console.log('⚠️  ATTENTION: Cette action va supprimer TOUS les abonnements de cet utilisateur');
    console.log('Pour continuer, modifiez le script et mettez confirmDelete = true');
    
    const confirmDelete = true; // Mettre à true pour confirmer la suppression
    
    if (!confirmDelete) {
      console.log('❌ Suppression annulée. Modifiez confirmDelete = true pour confirmer.');
      return;
    }
    
    // 6. Supprimer tous les abonnements de l'utilisateur
    console.log('\n🗑️  Suppression des abonnements...');
    
    const { data: deletedSubs, error: deleteError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .select();
    
    if (deleteError) {
      console.log('❌ Erreur lors de la suppression:', deleteError.message);
      return;
    }
    
    console.log(`✅ ${deletedSubs?.length || 0} abonnements supprimés avec succès`);
    
    // 7. Vérifier que les abonnements ont bien été supprimés
    const { data: remainingSubs, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id);
    
    if (checkError) {
      console.log('❌ Erreur lors de la vérification:', checkError.message);
      return;
    }
    
    if (!remainingSubs || remainingSubs.length === 0) {
      console.log('✅ Vérification réussie: Aucun abonnement restant');
    } else {
      console.log(`⚠️  Attention: ${remainingSubs.length} abonnements restent encore`);
    }
    
    // 8. Afficher un résumé
    console.log('\n📋 Résumé:');
    console.log(`- Utilisateur: ${targetEmail}`);
    console.log(`- Abonnements supprimés: ${deletedSubs?.length || 0}`);
    console.log(`- Abonnements restants: ${remainingSubs?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkAndClearUserSubscriptions(); 