const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTokenViaTestAPI() {
  const targetEmail = 'regispailler@gmail.com';
  
  try {
    console.log(`🔍 Création de token via API de test pour: ${targetEmail}`);
    
    // 1. Trouver l'utilisateur
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
    
    // 2. Trouver le module (ID: 13 = ruinedfooocus)
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', 13)
      .single();
    
    if (moduleError || !module) {
      console.log('❌ Module ID 13 non trouvé');
      return;
    }
    
    console.log(`✅ Module trouvé: ${module.title} (${module.category}) - ${module.price}€`);
    
    // 3. Générer un token via l'API de test
    console.log('🔑 Génération du token via API de test...');
    
    const response = await fetch('http://localhost:8021/api/create-test-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        moduleId: 13,
        moduleName: module.title
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ Erreur API:', response.status, errorData);
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Token généré avec succès via API de test !');
      console.log('\n📋 Détails du token:');
      console.log(`- ID: ${result.token.id}`);
      console.log(`- Nom: ${result.token.name}`);
      console.log(`- Module: ${module.title}`);
      console.log(`- Utilisations: ${result.token.current_usage} / ${result.token.max_usage}`);
      console.log(`- Statut: ${result.token.is_active ? 'Actif' : 'Inactif'}`);
      console.log(`- Créé: ${new Date(result.token.created_at).toLocaleDateString()}`);
      console.log(`- Expire: ${new Date(result.token.expires_at).toLocaleDateString()}`);
      
      console.log('\n🎉 Le token a été créé via l\'API de test !');
      console.log('💡 Maintenant, quand vous visiterez /encours, vous devriez voir les informations du token.');
    } else {
      console.log('❌ Erreur lors de la génération:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    console.log('💡 Assurez-vous que le serveur de développement fonctionne sur http://localhost:8021');
  }
}

createTokenViaTestAPI(); 