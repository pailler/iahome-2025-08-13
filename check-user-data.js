const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserData() {
  try {
    console.log('🔍 Vérification des données utilisateur...');
    
    // Récupérer les utilisateurs
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (userError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', userError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    console.log(`✅ ${users.length} utilisateur(s) trouvé(s):`);
    users.forEach((user, index) => {
      console.log(`\n👤 Utilisateur ${index + 1}:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email || '❌ EMAIL MANQUANT'}`);
      console.log(`   - Créé le: ${user.created_at}`);
      console.log(`   - Dernière connexion: ${user.last_sign_in_at || 'Jamais'}`);
    });
    
    // Vérifier aussi la table profiles
    console.log('\n🔍 Vérification de la table profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profileError) {
      console.error('❌ Erreur lors de la récupération des profiles:', profileError);
    } else if (profiles && profiles.length > 0) {
      console.log(`✅ ${profiles.length} profile(s) trouvé(s):`);
      profiles.forEach((profile, index) => {
        console.log(`\n👤 Profile ${index + 1}:`);
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Email: ${profile.email || '❌ EMAIL MANQUANT'}`);
        console.log(`   - Nom: ${profile.full_name || 'Non défini'}`);
      });
    } else {
      console.log('❌ Aucun profile trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Script principal
(async () => {
  console.log('🚀 Vérification des données utilisateur...\n');
  
  await checkUserData();
  
  console.log('\n🎉 Script terminé !');
})();