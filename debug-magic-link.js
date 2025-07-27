const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugMagicLink() {
  try {
    console.log('🔍 Debug du magic link...\n');
    
    const token = '29bd8d2d81a496b239a591e829e9048ebacafd2b0bfd32b3b9a5d1c63e50878d';
    
    console.log('📋 Recherche du magic link avec le token:', token);
    
    // Rechercher le magic link
    const { data, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      return;
    }

    if (!data) {
      console.log('❌ Magic link non trouvé');
      return;
    }

    console.log('✅ Magic link trouvé !');
    console.log('📋 Détails:');
    console.log('   - ID:', data.id);
    console.log('   - Token:', data.token);
    console.log('   - User ID:', data.user_id);
    console.log('   - Module:', data.module_name);
    console.log('   - Email:', data.user_email);
    console.log('   - Expiration:', data.expires_at);
    console.log('   - Utilisé:', data.is_used);
    console.log('   - Créé le:', data.created_at);

    // Vérifier l'expiration
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const isExpired = expiresAt < now;
    
    console.log('\n⏰ Vérification de l\'expiration:');
    console.log('   - Date actuelle:', now.toISOString());
    console.log('   - Date d\'expiration:', expiresAt.toISOString());
    console.log('   - Expiré:', isExpired);

    // Vérifier si le magic link peut être utilisé
    console.log('\n🔍 État du magic link:');
    console.log('   - Existe:', !!data);
    console.log('   - Non utilisé:', !data.is_used);
    console.log('   - Non expiré:', !isExpired);
    console.log('   - Peut être utilisé:', !!data && !data.is_used && !isExpired);

    // Lister tous les magic links pour ce user
    console.log('\n📊 Tous les magic links pour ce user:');
    const { data: allLinks, error: allError } = await supabase
      .from('magic_links')
      .select('*')
      .eq('user_id', data.user_id)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Erreur lors de la recherche de tous les liens:', allError);
    } else {
      allLinks.forEach((link, index) => {
        console.log(`   [${index + 1}] ${link.token.substring(0, 20)}... - Utilisé: ${link.is_used} - Expire: ${new Date(link.expires_at).toLocaleString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
}

// Exécuter le script
debugMagicLink()
  .then(() => {
    console.log('\n🎉 Debug terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });