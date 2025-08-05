const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTokenAdmin() {
  const targetEmail = 'regispailler@gmail.com';
  
  try {
    console.log(`🔍 Création de token avec compte admin pour: ${targetEmail}`);
    
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
    
    // 3. Créer un token d'accès avec des données minimales
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 jours
    
    const tokenData = {
      id: tokenId,
      name: `Token ${module.title} - ${targetEmail}`,
      description: `Token d'accès pour ${module.title} créé manuellement`,
      module_id: 13,
      module_name: module.title,
      access_level: 'basic',
      permissions: ['access'],
      max_usage: 100,
      current_usage: 0,
      is_active: true,
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
      jwt_token: 'manual-token-' + tokenId
    };
    
    console.log('🔑 Création du token...');
    console.log('📋 Données du token:', JSON.stringify(tokenData, null, 2));
    
    // Essayer d'insérer directement
    const { data: newToken, error: tokenError } = await supabase
      .from('access_tokens')
      .insert([tokenData])
      .select()
      .single();
    
    if (tokenError) {
      console.log('❌ Erreur lors de la création du token:', tokenError.message);
      console.log('💡 Tentative avec des données modifiées...');
      
      // Essayer avec des données plus simples
      const simpleTokenData = {
        name: `Token ${module.title}`,
        module_id: 13,
        access_level: 'basic',
        max_usage: 100,
        current_usage: 0,
        is_active: true,
        created_by: user.id,
        expires_at: expiresAt.toISOString()
      };
      
      const { data: simpleToken, error: simpleError } = await supabase
        .from('access_tokens')
        .insert([simpleTokenData])
        .select()
        .single();
      
      if (simpleError) {
        console.log('❌ Erreur même avec données simples:', simpleError.message);
        console.log('💡 Le problème vient probablement des politiques RLS');
        return;
      } else {
        console.log('✅ Token créé avec données simplifiées !');
        console.log('\n📋 Détails du token:');
        console.log(`- ID: ${simpleToken.id}`);
        console.log(`- Nom: ${simpleToken.name}`);
        console.log(`- Module: ${module.title}`);
        console.log(`- Utilisations: ${simpleToken.current_usage} / ${simpleToken.max_usage}`);
        console.log(`- Statut: ${simpleToken.is_active ? 'Actif' : 'Inactif'}`);
        console.log(`- Créé: ${new Date(simpleToken.created_at).toLocaleDateString()}`);
        console.log(`- Expire: ${new Date(simpleToken.expires_at).toLocaleDateString()}`);
      }
    } else {
      console.log('✅ Token créé avec succès !');
      console.log('\n📋 Détails du token:');
      console.log(`- ID: ${newToken.id}`);
      console.log(`- Nom: ${newToken.name}`);
      console.log(`- Module: ${module.title}`);
      console.log(`- Utilisations: ${newToken.current_usage} / ${newToken.max_usage}`);
      console.log(`- Statut: ${newToken.is_active ? 'Actif' : 'Inactif'}`);
      console.log(`- Créé: ${new Date(newToken.created_at).toLocaleDateString()}`);
      console.log(`- Expire: ${new Date(newToken.expires_at).toLocaleDateString()}`);
    }
    
    console.log('\n🎉 Le token a été créé !');
    console.log('💡 Maintenant, quand vous visiterez /encours, vous devriez voir les informations du token.');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

createTokenAdmin(); 