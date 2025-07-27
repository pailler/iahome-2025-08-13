const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addIatubeSubscription() {
  try {
    console.log('🔍 Ajout de l\'abonnement iatube...');
    
    // Récupérer un user_id
    let { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
    if (userError || !users || users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const userId = users[0].id;
    console.log('👤 Utilisateur trouvé:', userId);
    
    // Date d'expiration (1 an)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    const subscriptionData = {
      user_id: userId,
      subscription_id: 'iatube-sub-789',
      module_name: 'iatube',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString()
      // Pas de subscription_type
    };
    
    console.log('📋 Données de l\'abonnement:');
    console.log('   - User ID:', userId);
    console.log('   - Module:', subscriptionData.module_name);
    console.log('   - Status:', subscriptionData.status);
    console.log('   - Expiration:', endDate.toLocaleString('fr-FR'));
    
    // Insérer dans Supabase
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select();
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      return;
    }
    
    console.log('✅ Abonnement iatube créé avec succès !');
    console.log('📋 ID:', data[0].id);
    
    return data[0];
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

// Script principal
(async () => {
  console.log('🚀 Ajout de l\'abonnement iatube...\n');
  
  await addIatubeSubscription();
  
  console.log('\n🎉 Script terminé !');
})();