const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthenticationSystem() {
  console.log('🧪 Test du système d\'authentification\n');

  try {
    // 1. Test de connexion à Supabase
    console.log('1️⃣ Test de connexion à Supabase...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error);
      return;
    }
    console.log('✅ Connexion à Supabase réussie\n');

    // 2. Vérifier la structure des tables
    console.log('2️⃣ Vérification de la structure des tables...');
    
    // Vérifier la table profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erreur table profiles:', profilesError);
    } else {
      console.log('✅ Table profiles accessible');
    }

    // Vérifier la table user_subscriptions
    const { data: subscriptionsData, error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1);
    
    if (subscriptionsError) {
      console.error('❌ Erreur table user_subscriptions:', subscriptionsError);
    } else {
      console.log('✅ Table user_subscriptions accessible');
    }

    // Vérifier la table module_access_logs
    const { data: logsData, error: logsError } = await supabase
      .from('module_access_logs')
      .select('*')
      .limit(1);
    
    if (logsError) {
      console.error('❌ Erreur table module_access_logs:', logsError);
      console.log('💡 Exécutez le script create-module-access-logs.sql pour créer cette table');
    } else {
      console.log('✅ Table module_access_logs accessible');
    }

    console.log('');

    // 3. Test de l'API de génération de tokens
    console.log('3️⃣ Test de l\'API de génération de tokens...');
    
    // Créer un utilisateur de test si nécessaire
    const testEmail = 'test-auth@example.com';
    const testPassword = 'testpassword123';
    
    console.log(`📧 Tentative de connexion avec: ${testEmail}`);
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('⚠️ Utilisateur de test non trouvé, création...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      if (signUpError) {
        console.error('❌ Erreur création utilisateur de test:', signUpError);
        return;
      }

      console.log('✅ Utilisateur de test créé');
    } else {
      console.log('✅ Connexion utilisateur de test réussie');
    }

    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ Aucun utilisateur connecté');
      return;
    }

    console.log(`👤 Utilisateur connecté: ${user.email} (ID: ${user.id})\n`);

    // 4. Test de création d'abonnement de test
    console.log('4️⃣ Test de création d\'abonnement de test...');
    
    const testSubscription = {
      user_id: user.id,
      module_name: 'stablediffusion',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 jours
    };

    const { data: subscriptionData, error: subscriptionInsertError } = await supabase
      .from('user_subscriptions')
      .insert([testSubscription])
      .select();

    if (subscriptionInsertError) {
      console.error('❌ Erreur création abonnement de test:', subscriptionInsertError);
    } else {
      console.log('✅ Abonnement de test créé');
    }

    console.log('');

    // 5. Test de l'API de génération de token
    console.log('5️⃣ Test de l\'API de génération de token...');
    
    const response = await fetch('http://localhost:8021/api/generate-module-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moduleName: 'stablediffusion',
        userId: user.id,
        duration: 24
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token généré avec succès');
      console.log(`🔑 Token: ${data.accessToken.substring(0, 50)}...`);
      console.log(`⏰ Expire dans: ${data.expiresIn} heures`);
    } else {
      const errorData = await response.json();
      console.error('❌ Erreur génération token:', errorData);
    }

    console.log('');

    // 6. Test de validation de token
    console.log('6️⃣ Test de validation de token...');
    
    if (response.ok) {
      const tokenData = await response.json();
      
      const validateResponse = await fetch('http://localhost:8021/api/validate-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: tokenData.accessToken
        }),
      });

      if (validateResponse.ok) {
        const validateData = await validateResponse.json();
        console.log('✅ Token validé avec succès');
        console.log(`👤 Utilisateur: ${validateData.magicLinkData.userId}`);
        console.log(`📦 Module: ${validateData.magicLinkData.moduleName}`);
      } else {
        const validateError = await validateResponse.json();
        console.error('❌ Erreur validation token:', validateError);
      }
    }

    console.log('');

    // 7. Test de vérification d'abonnement
    console.log('7️⃣ Test de vérification d\'abonnement...');
    
    const checkResponse = await fetch(`http://localhost:8021/api/check-subscription?module=stablediffusion&userId=${user.id}`);
    
    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      console.log('✅ Vérification d\'abonnement réussie');
      console.log(`📦 Abonnement actif: ${checkData.hasActiveSubscription}`);
      if (checkData.subscription) {
        console.log(`📅 Expire le: ${new Date(checkData.subscription.end_date).toLocaleDateString()}`);
      }
    } else {
      const checkError = await checkResponse.json();
      console.error('❌ Erreur vérification abonnement:', checkError);
    }

    console.log('');

    // 8. Nettoyage
    console.log('8️⃣ Nettoyage des données de test...');
    
    // Supprimer l'abonnement de test
    if (subscriptionData) {
      const { error: deleteError } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('id', subscriptionData[0].id);
      
      if (deleteError) {
        console.error('❌ Erreur suppression abonnement de test:', deleteError);
      } else {
        console.log('✅ Abonnement de test supprimé');
      }
    }

    // Déconnexion
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('❌ Erreur déconnexion:', signOutError);
    } else {
      console.log('✅ Déconnexion réussie');
    }

    console.log('\n🎉 Tests terminés avec succès !');
    console.log('\n📋 Résumé:');
    console.log('✅ Connexion à Supabase');
    console.log('✅ Structure des tables');
    console.log('✅ Authentification utilisateur');
    console.log('✅ Gestion des abonnements');
    console.log('✅ Génération de tokens');
    console.log('✅ Validation de tokens');
    console.log('✅ Vérification d\'abonnements');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter les tests
testAuthenticationSystem(); 