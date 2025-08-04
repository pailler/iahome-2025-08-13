// Script pour tester les permissions Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre configuration)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabasePermissions() {
  console.log('🔍 Test des permissions Supabase...');
  
  try {
    // Test 1: Vérifier la connexion de base
    console.log('\n📡 Test 1: Vérification de la connexion...');
    const { data: testData, error: testError } = await supabase
      .from('modules')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError);
      console.log('💡 Cela peut indiquer un problème de RLS (Row Level Security)');
      return;
    }
    console.log('✅ Connexion réussie');

    // Test 2: Tenter de lire les modules sans authentification
    console.log('\n📡 Test 2: Lecture des modules sans authentification...');
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .limit(5);

    if (modulesError) {
      console.error('❌ Erreur lors de la lecture des modules:', modulesError);
      console.log('💡 Problème probable: RLS activé sans politique de lecture publique');
    } else {
      console.log(`✅ ${modulesData.length} modules lus avec succès`);
      console.log('📊 Exemples de modules:', modulesData.map(m => ({ id: m.id, title: m.title })));
    }

    // Test 3: Vérifier l'état de l'authentification
    console.log('\n📡 Test 3: État de l\'authentification...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erreur lors de la vérification de session:', sessionError);
    } else if (session) {
      console.log('✅ Utilisateur authentifié:', session.user.email);
      
      // Test 4: Vérifier le rôle de l'utilisateur
      console.log('\n📡 Test 4: Vérification du rôle utilisateur...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Erreur lors de la vérification du profil:', profileError);
      } else {
        console.log('✅ Rôle utilisateur:', profileData.role);
        
        // Test 5: Tenter des opérations d'administration
        if (profileData.role === 'admin') {
          console.log('\n📡 Test 5: Test des opérations d\'administration...');
          
          // Test d'insertion
          const testModule = {
            title: 'Test Module',
            description: 'Module de test temporaire',
            category: 'TEST',
            price: 0.00
          };
          
          const { data: insertData, error: insertError } = await supabase
            .from('modules')
            .insert([testModule])
            .select();
          
          if (insertError) {
            console.error('❌ Erreur lors de l\'insertion:', insertError);
          } else {
            console.log('✅ Insertion réussie:', insertData[0].id);
            
            // Supprimer le module de test
            const { error: deleteError } = await supabase
              .from('modules')
              .delete()
              .eq('id', insertData[0].id);
            
            if (deleteError) {
              console.error('❌ Erreur lors de la suppression:', deleteError);
            } else {
              console.log('✅ Suppression réussie');
            }
          }
        } else {
          console.log('ℹ️ Utilisateur non-admin, test d\'administration ignoré');
        }
      }
    } else {
      console.log('ℹ️ Aucun utilisateur authentifié');
    }

    // Test 6: Vérifier les politiques RLS
    console.log('\n📡 Test 6: Vérification des politiques RLS...');
    console.log('💡 Pour vérifier les politiques RLS, exécutez le script SQL:');
    console.log('   - fix-modules-rls-policies.sql');
    console.log('   - disable-modules-rls-temp.sql (pour les tests)');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le test
testSupabasePermissions().then(() => {
  console.log('\n✅ Test terminé');
  console.log('\n📋 Actions recommandées:');
  console.log('1. Exécuter fix-modules-rls-policies.sql pour configurer les politiques');
  console.log('2. Ou exécuter disable-modules-rls-temp.sql pour désactiver RLS temporairement');
  console.log('3. Vérifier les rôles utilisateurs avec check-and-fix-user-roles.sql');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur lors du test:', error);
  process.exit(1);
}); 