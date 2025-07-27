const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuration Supabase avec la vraie URL et la vraie clé anonyme
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

console.log('🔍 Création d\'un magic link de test...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour générer un UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

async function createSimpleMagicLink(userId) {
  try {
    // Données de test avec un user_id réel
    const testData = {
      userId: userId,
      subscriptionId: 'test-sub-456',
      moduleName: 'test-module',
      userEmail: 'test@example.com',
      redirectUrl: 'https://test.example.com/access'
    };

    // Générer un token sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    
    // Définir l'expiration (24 heures)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    console.log('🔍 Token généré:', token);
    console.log('🔍 Expiration:', expiresAt.toISOString());
    console.log('🔍 Données de test:', testData);

    // Insérer le magic link dans Supabase
    console.log('\n📝 Insertion dans la table magic_links...');
    const { data, error } = await supabase
      .from('magic_links')
      .insert({
        token,
        user_id: testData.userId,
        subscription_id: testData.subscriptionId,
        module_name: testData.moduleName,
        user_email: testData.userEmail,
        redirect_url: testData.redirectUrl,
        expires_at: expiresAt.toISOString(),
        is_used: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur insertion magic link:', error);
      console.log('\n💡 Vérifiez que:');
      console.log('   - Votre base de données Supabase est accessible');
      console.log('   - La table "magic_links" existe');
      console.log('   - Vous avez les permissions d\'insertion');
      console.log('   - Votre clé anonyme Supabase est correcte');
      return;
    }

    console.log('✅ Magic link créé avec succès !');
    console.log('📋 Détails du magic link:');
    console.log('   - ID:', data.id);
    console.log('   - Token:', token);
    console.log('   - User ID:', data.user_id);
    console.log('   - Module:', data.module_name);
    console.log('   - Email:', data.user_email);
    console.log('   - Expiration:', data.expires_at);
    console.log('   - Utilisé:', data.is_used);

    // Construire l'URL du magic link
    const baseUrl = 'https://home.regispailler.fr';
    const magicLinkUrl = `${baseUrl}/access/${testData.moduleName}?token=${token}&user=${testData.userId}`;
    
    console.log('\n🔗 URL du magic link:', magicLinkUrl);

    // Vérifier que le magic link a bien été créé
    console.log('\n🔍 Vérification de la création...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .single();

    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
    } else {
      console.log('✅ Magic link vérifié dans la base de données');
      console.log('   - Trouvé dans la table:', !!verifyData);
      console.log('   - Token correspond:', verifyData.token === token);
    }

    // Afficher les informations pour tester
    console.log('\n🧪 Pour tester ce magic link:');
    console.log('1. Copiez l\'URL ci-dessus');
    console.log('2. Ouvrez-la dans un navigateur');
    console.log('3. Vérifiez que l\'accès fonctionne');
    console.log('4. Le magic link sera marqué comme "utilisé" après validation');

    // Afficher la requête SQL pour vérifier manuellement
    console.log('\n📊 Requête SQL pour vérifier manuellement:');
    console.log(`SELECT * FROM magic_links WHERE token = '${token}';`);

  } catch (error) {
    console.error('❌ Erreur lors de la création du magic link:', error);
  }
}

// Script principal
(async () => {
  const userIds = await listUserIds();
  if (userIds.length === 0) {
    console.log('Aucun user_id trouvé. Veuillez créer un utilisateur d\'abord.');
    return;
  }
  console.log('\nCréation du magic link avec le user_id :', userIds[0]);
  await createSimpleMagicLink(userIds[0]);
})();