const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTokenForRegispailler() {
  const targetEmail = 'regispailler@gmail.com';
  
  try {
    console.log(`🔍 Création de token pour: ${targetEmail}`);
    
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
    
    // 2. Trouver le module Stable diffusion (ID: 13)
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
    
    // 3. Créer un token d'accès
    const tokenData = {
      name: `Token ${module.title} - ${targetEmail}`,
      description: `Token d'accès pour ${module.title} créé automatiquement`,
      module_id: 13,
      access_level: 'basic',
      permissions: ['access'],
      max_usage: 100,
      current_usage: 0,
      is_active: true,
      created_by: user.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
      jwt_token: 'auto-generated'
    };
    
    console.log('🔑 Création du token...');
    const { data: newToken, error: tokenError } = await supabase
      .from('access_tokens')
      .insert([tokenData])
      .select()
      .single();
    
    if (tokenError) {
      console.log('❌ Erreur lors de la création du token:', tokenError.message);
      return;
    }
    
    console.log('✅ Token créé avec succès !');
    console.log('\n📋 Détails du token:');
    console.log(`- ID: ${newToken.id}`);
    console.log(`- Nom: ${newToken.name}`);
    console.log(`- Module: ${module.title}`);
    console.log(`- Utilisations: ${newToken.current_usage} / ${newToken.max_usage}`);
    console.log(`- Statut: ${newToken.is_active ? 'Actif' : 'Inactif'}`);
    console.log(`- Créé: ${new Date(newToken.created_at).toLocaleDateString()}`);
    console.log(`- Expire: ${new Date(newToken.expires_at).toLocaleDateString()}`);
    
    console.log('\n🎉 Le token a été créé !');
    console.log('💡 Maintenant, quand vous visiterez /encours, vous devriez voir les informations du token.');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

createTokenForRegispailler(); 