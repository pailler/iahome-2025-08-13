const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testValidation() {
  try {
    console.log('🧪 Test de validation directe...\n');
    
    const token = '29bd8d2d81a496b239a591e829e9048ebacafd2b0bfd32b3b9a5d1c63e50878d';
    
    console.log('🔍 [DEBUG] Validation du token:', token);
    console.log('🔍 [DEBUG] Recherche dans Supabase...');
    
    // Test 1: Recherche simple
    const { data, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .single();

    console.log('🔍 [DEBUG] Résultat Supabase:', { data, error });
    console.log('🔍 [DEBUG] Erreur complète:', JSON.stringify(error, null, 2));

    if (error) {
      console.log('❌ [DEBUG] Erreur Supabase:', error);
      console.log('❌ [DEBUG] Code erreur:', error.code);
      console.log('❌ [DEBUG] Message erreur:', error.message);
      return;
    }

    if (!data) {
      console.log('❌ [DEBUG] Magic link non trouvé');
      return;
    }

    console.log('✅ [DEBUG] Magic link trouvé:', data);

    // Test 2: Vérification is_used
    console.log('\n🔍 [DEBUG] Vérification is_used:', data.is_used);
    if (data.is_used) {
      console.log('❌ [DEBUG] Magic link déjà utilisé');
      return;
    }

    // Test 3: Vérification expiration
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    console.log('🔍 [DEBUG] Vérification expiration:', {
      now: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isExpired: expiresAt < now
    });

    if (expiresAt < now) {
      console.log('❌ [DEBUG] Magic link expiré');
      return;
    }

    console.log('✅ [DEBUG] Magic link validé avec succès!');
    console.log('📋 Détails finaux:', {
      moduleName: data.module_name,
      userId: data.user_id,
      expiresAt: expiresAt,
      isValid: true
    });

  } catch (error) {
    console.error('❌ [DEBUG] Erreur validation token:', error);
  }
}

// Exécuter le test
testValidation()
  .then(() => {
    console.log('\n🎉 Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });