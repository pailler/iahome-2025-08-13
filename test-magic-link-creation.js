const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const readline = require('readline');

// Configuration pour lire les entrées utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour demander une valeur à l'utilisateur
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createTestMagicLink() {
  try {
    console.log('🔍 Création d\'un magic link de test...\n');
    
    // Essayer de charger les variables d'environnement
    try {
      require('dotenv').config();
    } catch (e) {
      console.log('⚠️  Fichier .env non trouvé, utilisation des valeurs par défaut');
    }

    // Récupérer les variables Supabase
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Si les variables ne sont pas définies, demander à l'utilisateur
    if (!supabaseUrl) {
      console.log('❌ Variable NEXT_PUBLIC_SUPABASE_URL non trouvée');
      supabaseUrl = await askQuestion('Entrez votre URL Supabase (ex: https://your-project.supabase.co): ');
    }

    if (!supabaseAnonKey) {
      console.log('❌ Variable NEXT_PUBLIC_SUPABASE_ANON_KEY non trouvée');
      supabaseAnonKey = await askQuestion('Entrez votre clé anonyme Supabase: ');
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Configuration Supabase incomplète');
      rl.close();
      return;
    }

    console.log('\n✅ Configuration Supabase récupérée');
    console.log('URL:', supabaseUrl);
    console.log('Clé anonyme:', supabaseAnonKey.substring(0, 20) + '...');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Données de test
    const testData = {
      userId: 'test-user-123',
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

    console.log('\n🔍 Token généré:', token);
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
      rl.close();
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr';
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

  } catch (error) {
    console.error('❌ Erreur lors de la création du magic link:', error);
  } finally {
    rl.close();
  }
}

// Exécuter le script
createTestMagicLink()
  .then(() => {
    console.log('\n🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });