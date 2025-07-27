const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addIatubeCard() {
  try {
    console.log('🔗 Ajout de la carte iatube via API...');
    
    // Vérifier d'abord si la carte existe déjà
    const { data: existingCards, error: checkError } = await supabase
      .from('cartes')
      .select('*')
      .eq('title', 'iatube');
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError);
      return;
    }
    
    if (existingCards && existingCards.length > 0) {
      console.log('✅ Carte iatube existe déjà !');
      console.log('📋 ID:', existingCards[0].id);
      return existingCards[0];
    }
    
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
    
    // Essayer d'insérer avec une approche différente
    console.log('🔍 Tentative d\'insertion...');
    
    // Utiliser une requête SQL directe si possible
    const { data, error } = await supabase
      .rpc('insert_carte', {
        p_title: cardData.title,
        p_description: cardData.description,
        p_category: cardData.category,
        p_price: cardData.price,
        p_youtube_url: cardData.youtube_url
      });
    
    if (error) {
      console.log('❌ Erreur avec RPC, tentative directe...');
      
      // Essayer l'insertion directe
      const { data: insertData, error: insertError } = await supabase
        .from('cartes')
        .insert([cardData])
        .select();
      
      if (insertError) {
        console.error('❌ Erreur lors de l\'insertion directe:', insertError);
        console.error('❌ Code erreur:', insertError.code);
        console.error('❌ Message erreur:', insertError.message);
        
        // Essayer avec des données minimales
        console.log('🔍 Tentative avec données minimales...');
        const minimalData = {
          title: 'iatube',
          description: 'Test module',
          category: 'IA VIDEO',
          price: 0
        };
        
        const { data: minimalInsertData, error: minimalError } = await supabase
          .from('cartes')
          .insert([minimalData])
          .select();
        
        if (minimalError) {
          console.error('❌ Erreur même avec données minimales:', minimalError);
          return;
        } else {
          console.log('✅ Carte iatube créée avec données minimales !');
          console.log('📋 ID:', minimalInsertData[0].id);
          return minimalInsertData[0];
        }
      } else {
        console.log('✅ Carte iatube créée avec succès !');
        console.log('📋 ID:', insertData[0].id);
        return insertData[0];
      }
    } else {
      console.log('✅ Carte iatube créée via RPC !');
      console.log('📋 ID:', data.id);
      return data;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

// Script principal
(async () => {
  console.log('🚀 Ajout de la carte iatube via API...\n');
  
  await addIatubeCard();
  
  console.log('\n🎉 Script terminé !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Connectez-vous à votre application');
  console.log('2. Allez sur la page /encours');
  console.log('3. Cherchez l\'abonnement "iatube"');
  console.log('4. Cliquez sur "Générer Magic Link"');
  console.log('5. Vous devriez être redirigé vers Google !');
})();