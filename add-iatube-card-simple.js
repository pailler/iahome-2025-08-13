const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addIatubeCard() {
  try {
    console.log('🔗 Ajout de la carte iatube...');
    
    const cardData = {
      title: 'iatube',
      description: 'Module de test pour redirection vers Google via magic link',
      category: 'IA VIDEO',
      price: 0,
      youtube_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
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
      console.error('❌ Code erreur:', error.code);
      console.error('❌ Message erreur:', error.message);
      return;
    }
    
    console.log('✅ Carte iatube ajoutée avec succès !');
    console.log('📋 ID:', data[0].id);
    
    return data[0];
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

// Script principal
(async () => {
  console.log('🚀 Ajout de la carte iatube...\n');
  
  await addIatubeCard();
  
  console.log('\n🎉 Script terminé !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Connectez-vous à votre application en tant qu\'admin');
  console.log('2. Cherchez la carte "iatube" dans la liste');
  console.log('3. Cliquez sur le bouton "📺 Accéder"');
  console.log('4. Vous devriez être redirigé vers Google !');
})();