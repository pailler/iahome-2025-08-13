require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (clés hardcodées depuis src/utils/supabaseClient.ts)
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
// Utiliser la clé service_role au lieu de la clé anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSDNextYouTube() {
  console.log('🔍 Vérification de la carte SDNext...\n');

  try {
    // Récupérer la carte SDNext
    const { data: card, error } = await supabase
      .from('cartes')
      .select('id, title, youtube_url, image_url')
      .ilike('title', '%sdnext%')
      .single();

    if (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      return;
    }

    if (!card) {
      console.log('❌ Carte SDNext non trouvée');
      return;
    }

    console.log('📋 Informations de la carte SDNext:');
    console.log(`   ID: ${card.id}`);
    console.log(`   Titre: ${card.title}`);
    console.log(`   Image URL: ${card.image_url || 'Non définie'}`);
    console.log(`   YouTube URL: ${card.youtube_url || 'Non définie'}`);

    if (!card.youtube_url) {
      console.log('\n⚠️  Pas d\'URL YouTube trouvée !');
      console.log('💡 Il faut ajouter une URL YouTube pour la page détaillée');
    } else {
      console.log('\n✅ URL YouTube trouvée !');
      console.log(`🔗 ${card.youtube_url}`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkSDNextYouTube(); 