const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listUserIds() {
  // Essaye d'abord la table 'users', sinon 'profiles'
  let { data, error } = await supabase.from('users').select('id').limit(10);
  if (error || !data || data.length === 0) {
    ({ data, error } = await supabase.from('profiles').select('id').limit(10));
    if (error || !data || data.length === 0) {
      console.log('❌ Impossible de récupérer des user_id dans users ou profiles.');
      return [];
    } else {
      console.log('\n👤 Utilisateurs trouvés dans la table profiles :');
    }
  } else {
    console.log('\n👤 Utilisateurs trouvés dans la table users :');
  }
  data.forEach((u, i) => console.log(`  [${i+1}] ${u.id}`));
  return data.map(u => u.id);
}

async function addIatubeSubscription(userId) {
  try {
    console.log('\n🔗 Ajout de l\'abonnement iatube...');
    
    // Date d'expiration (1 an)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    const subscriptionData = {
      user_id: userId,
      module_name: 'iatube',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString(),
      subscription_type: 'premium'
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
    
    console.log('✅ Abonnement iatube ajouté avec succès !');
    console.log('📋 ID:', data[0].id);
    
    return data[0];
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

// Script principal
(async () => {
  console.log('🚀 Ajout de l\'abonnement iatube...\n');
  
  const userIds = await listUserIds();
  if (userIds.length === 0) {
    console.log('Aucun user_id trouvé. Veuillez créer un utilisateur d\'abord.');
    return;
  }
  
  console.log('\nAjout de l\'abonnement pour le user_id :', userIds[0]);
  await addIatubeSubscription(userIds[0]);
  
  console.log('\n🎉 Script terminé !');
})();