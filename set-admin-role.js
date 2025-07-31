require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAdminRole() {
  console.log('🔧 Définition du rôle admin');
  console.log('============================\n');
  
  try {
    // 1. Trouver l'utilisateur formateur_tic@hotmail.com
    console.log('🔍 Recherche de l\'utilisateur formateur_tic@hotmail.com...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', 'formateur_tic@hotmail.com')
      .single();
    
    if (profileError) {
      console.error('❌ Erreur recherche profil:', profileError);
      return;
    }
    
    if (!profile) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:');
    console.log('   ID:', profile.id);
    console.log('   Email:', profile.email);
    console.log('   Rôle actuel:', profile.role);
    
    // 2. Mettre à jour le rôle vers admin
    console.log('\n🔧 Mise à jour du rôle vers "admin"...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profile.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError);
      return;
    }
    
    console.log('✅ Rôle mis à jour avec succès !');
    console.log('   Nouveau rôle:', updateData[0].role);
    
    // 3. Vérifier la mise à jour
    console.log('\n🔍 Vérification de la mise à jour...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', 'formateur_tic@hotmail.com')
      .single();
    
    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError);
      return;
    }
    
    console.log('✅ Vérification réussie:');
    console.log('   Rôle final:', verifyProfile.role);
    
    console.log('\n🎉 Maintenant vous pouvez accéder à /admin/blog !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

setAdminRole(); 