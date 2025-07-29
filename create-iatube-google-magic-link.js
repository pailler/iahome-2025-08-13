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

async function createIatubeGoogleMagicLink(userId) {
  try {
    console.log('\n🔗 Création du magic link pour iatube (Metube)...');
    
    // Générer un token unique
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    
    // Date d'expiration (24h)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const testData = {
      token: token,
      user_id: userId,
      subscription_id: 'iatube-sub-789',
      module_name: 'iatube', // Module iatube
      user_email: 'test@example.com',
      redirect_url: 'https://metube.regispailler.fr',
      expires_at: expiresAt.toISOString(),
      is_used: false
    };
    
    console.log('📋 Données du magic link:');
    console.log('   - Token:', token);
    console.log('   - User ID:', userId);
    console.log('   - Module:', testData.module_name);
    console.log('   - Expiration:', expiresAt.toLocaleString('fr-FR'));
    
    // Insérer dans Supabase
    const { data, error } = await supabase
      .from('magic_links')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
      return;
    }
    
    console.log('✅ Magic link créé avec succès !');
    console.log('📋 ID:', data[0].id);
    
    // Générer l'URL de test
    const testUrl = `http://localhost:8021/access/test-module?token=${token}&user=${userId}`;
    console.log('\n🔗 URL de test:');
    console.log(testUrl);
    
    // URL de production (si nécessaire)
    const productionUrl = `https://votre-domaine.com/access/test-module?token=${token}&user=${userId}`;
    console.log('\n🌐 URL de production:');
    console.log(productionUrl);
    
    return token;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  }
}

// Script principal
(async () => {
  console.log('🚀 Création d\'un magic link pour iatube (Metube)...\n');
  
  const userIds = await listUserIds();
  if (userIds.length === 0) {
    console.log('Aucun user_id trouvé. Veuillez créer un utilisateur d\'abord.');
    return;
  }
  
  console.log('\nCréation du magic link avec le user_id :', userIds[0]);
  await createIatubeGoogleMagicLink(userIds[0]);
  
  console.log('\n🎉 Script terminé !');
})();