require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMetubePrice() {
  console.log('🔍 Vérification du prix du module Metube');
  
  try {
    // Vérifier le module Metube
    const { data: metubeData, error: metubeError } = await supabase
      .from('modules')
      .select('id, title, price, category')
      .eq('title', 'Metube')
      .single();

    if (metubeError) {
      console.error('❌ Erreur récupération Metube:', metubeError);
      return;
    }

    console.log('✅ Module Metube trouvé:', metubeData);
    console.log('💰 Prix:', metubeData.price, '(Type:', typeof metubeData.price + ')');
    console.log('🔍 Condition card.price === 0:', metubeData.price === 0);
    console.log('🔍 Condition card.price === "0":', metubeData.price === "0");

    // Vérifier aussi les autres modules gratuits
    console.log('\n📊 Vérification des autres modules gratuits...');
    const { data: allModules, error: allError } = await supabase
      .from('modules')
      .select('id, title, price')
      .order('title');

    if (allError) {
      console.error('❌ Erreur récupération modules:', allError);
      return;
    }

    console.log('📋 Tous les modules:');
    allModules?.forEach(module => {
      console.log(`  - ${module.title}: €${module.price} (Type: ${typeof module.price})`);
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkMetubePrice(); 