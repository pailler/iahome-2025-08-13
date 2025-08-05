const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEncoursPublic() {
  const targetEmail = 'regispailler@gmail.com';
  
  try {
    console.log(`🔍 Test de la page /encours avec l'URL publique pour: ${targetEmail}`);
    
    // 1. Vérifier que l'utilisateur existe et a des données
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', targetEmail)
      .single();
    
    if (userError || !user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.email} (${user.role}) - ID: ${user.id}`);
    
    // 2. Vérifier les accès modules
    const { data: moduleAccess, error: maError } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', user.id);
    
    if (maError) {
      console.log('❌ Erreur module_access:', maError.message);
    } else {
      console.log(`📊 ${moduleAccess?.length || 0} accès modules trouvés`);
    }
    
    // 3. Vérifier les tokens d'accès
    const { data: tokens, error: tokensError } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('created_by', user.id);
    
    if (tokensError) {
      console.log('❌ Erreur access_tokens:', tokensError.message);
    } else {
      console.log(`🔑 ${tokens?.length || 0} tokens trouvés`);
      
      if (tokens && tokens.length > 0) {
        console.log('\n📋 Tokens disponibles:');
        tokens.forEach((token, index) => {
          console.log(`${index + 1}. ${token.name}`);
          console.log(`   Module ID: ${token.module_id}`);
          console.log(`   Utilisations: ${token.current_usage || 0} / ${token.max_usage || '∞'}`);
          console.log(`   Statut: ${token.is_active ? 'Actif' : 'Inactif'}`);
          console.log(`   Expire: ${token.expires_at ? new Date(token.expires_at).toLocaleDateString() : 'Jamais'}`);
        });
      }
    }
    
    // 4. Tester l'API publique
    console.log('\n🌐 Test de l\'API publique...');
    
    try {
      const response = await fetch('https://home.regispailler.fr/api/check-session-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          moduleName: 'ruinedfooocus'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API publique accessible');
        console.log('📋 Réponse:', data);
      } else {
        console.log(`❌ Erreur API publique: ${response.status}`);
        const errorText = await response.text();
        console.log('📋 Détails:', errorText);
      }
    } catch (apiError) {
      console.log('❌ Erreur lors du test de l\'API publique:', apiError.message);
    }
    
    // 5. Afficher les URLs de test
    console.log('\n🔗 URLs de test:');
    console.log(`- Page /encours: https://home.regispailler.fr/encours`);
    console.log(`- Page d'accueil: https://home.regispailler.fr/`);
    console.log(`- Page de connexion: https://home.regispailler.fr/login`);
    
    console.log('\n📋 Instructions de test:');
    console.log('1. Connectez-vous avec regispailler@gmail.com');
    console.log('2. Allez sur https://home.regispailler.fr/encours');
    console.log('3. Vous devriez voir les informations du token ruinedfooocus');
    console.log('4. Vérifiez que les utilisations et la date d\'expiration s\'affichent');
    
    console.log('\n📊 Résumé des données:');
    console.log(`- Utilisateur: ${targetEmail}`);
    console.log(`- Accès modules: ${moduleAccess?.length || 0}`);
    console.log(`- Tokens d'accès: ${tokens?.length || 0}`);
    
    if (tokens && tokens.length > 0) {
      console.log('\n🎯 Token principal:');
      const mainToken = tokens[0];
      console.log(`- Nom: ${mainToken.name}`);
      console.log(`- Utilisations: ${mainToken.current_usage || 0} / ${mainToken.max_usage || '∞'}`);
      console.log(`- Statut: ${mainToken.is_active ? 'Actif' : 'Inactif'}`);
      console.log(`- Expire: ${mainToken.expires_at ? new Date(mainToken.expires_at).toLocaleDateString() : 'Jamais'}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testEncoursPublic(); 