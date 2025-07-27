const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndAddIatube() {
  try {
    console.log('🔍 Vérification de la carte iatube...');
    
    // Vérifier si la carte existe déjà
    const { data: existingCard, error: checkError } = await supabase
      .from('cartes')
      .select('*')
      .eq('title', 'iatube')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification:', checkError);
      return;
    }
    
    if (existingCard) {
      console.log('✅ Carte iatube existe déjà !');
      console.log('📋 ID:', existingCard.id);
      console.log('📋 Titre:', existingCard.title);
      console.log('📋 Catégorie:', existingCard.category);
      return existingCard;
    }
    
    console.log('❌ Carte iatube non trouvée, création...');
    
    const cardData = {
      title: 'iatube',
      description: 'Module de test pour redirection vers Google via magic link',
      category: 'IA VIDEO',
      price: 0,
      youtube_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Rick Roll pour le test
    };
    
    console.log('📋 Données de la carte:');
    console.log('   - Titre:', cardData.title);
    console.log('   - Description:', cardData.description);
    console.log('   - Catégorie:', cardData.category);
    console.log('   - Prix:', cardData.price);
    
    // Insérer dans Supabase
    const { data, error } = await supabase
      .from('cartes')
      .insert([cardData])
      .select();
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      return;
    }
    
    console.log('✅ Carte iatube créée avec succès !');
    console.log('📋 ID:', data[0].id);
    
    return data[0];
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification/création:', error);
  }
}

async function checkAndAddSubscription() {
  try {
    console.log('\n🔍 Vérification de l\'abonnement iatube...');
    
    // Récupérer un user_id
    let { data: users, error: userError } = await supabase.from('users').select('id').limit(1);
    if (userError || !users || users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    const userId = users[0].id;
    console.log('👤 Utilisateur trouvé:', userId);
    
    // Vérifier si l'abonnement existe déjà
    const { data: existingSub, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('module_name', 'iatube')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification:', checkError);
      return;
    }
    
    if (existingSub) {
      console.log('✅ Abonnement iatube existe déjà !');
      console.log('📋 ID:', existingSub.id);
      console.log('📋 Status:', existingSub.status);
      console.log('📋 Expiration:', existingSub.end_date);
      return existingSub;
    }
    
    console.log('❌ Abonnement iatube non trouvé, création...');
    
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
    
    console.log('✅ Abonnement iatube créé avec succès !');
    console.log('📋 ID:', data[0].id);
    
    return data[0];
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification/création:', error);
  }
}

// Script principal
(async () => {
  console.log('🚀 Vérification et ajout de iatube...\n');
  
  await checkAndAddIatube();
  await checkAndAddSubscription();
  
  console.log('\n🎉 Script terminé !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Connectez-vous à votre application');
  console.log('2. Cherchez la carte "iatube" dans la liste');
  console.log('3. Cliquez sur le bouton "📺 Accéder"');
  console.log('4. Vous devriez être redirigé vers Google !');
})();