require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAdminAccess() {
  console.log('🔍 Diagnostic de l\'accès admin');
  console.log('================================\n');
  
  try {
    // 1. Vérifier la session actuelle
    console.log('📋 Vérification de la session :');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erreur session:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('❌ Aucune session active');
      return;
    }
    
    console.log('✅ Session active pour:', session.user.email);
    console.log('   User ID:', session.user.id);
    
    // 2. Vérifier le profil utilisateur
    console.log('\n👤 Vérification du profil :');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erreur profil:', profileError);
      console.log('   Code:', profileError.code);
      console.log('   Message:', profileError.message);
      return;
    }
    
    if (!profile) {
      console.log('❌ Aucun profil trouvé');
      return;
    }
    
    console.log('✅ Profil trouvé:');
    console.log('   Email:', profile.email);
    console.log('   Rôle:', profile.role);
    console.log('   Créé le:', profile.created_at);
    
    // 3. Vérifier si l'utilisateur est admin
    console.log('\n🔐 Vérification des droits admin :');
    if (profile.role === 'admin') {
      console.log('✅ Utilisateur est admin');
    } else {
      console.log('❌ Utilisateur n\'est pas admin (rôle:', profile.role, ')');
    }
    
    // 4. Tester l'accès à la table blog_articles
    console.log('\n📝 Test d\'accès à blog_articles :');
    const { data: articles, error: articlesError } = await supabase
      .from('blog_articles')
      .select('id, title')
      .limit(1);
    
    if (articlesError) {
      console.error('❌ Erreur accès blog_articles:', articlesError);
    } else {
      console.log('✅ Accès à blog_articles OK');
      console.log('   Articles trouvés:', articles.length);
    }
    
    // 5. Suggestions de résolution
    console.log('\n🔧 Suggestions de résolution :');
    if (profile.role !== 'admin') {
      console.log('1. Mettre à jour le rôle vers "admin" :');
      console.log('   UPDATE profiles SET role = \'admin\' WHERE id = \'' + session.user.id + '\';');
    }
    
    console.log('2. Vérifier les politiques RLS sur profiles');
    console.log('3. Vérifier les politiques RLS sur blog_articles');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

debugAdminAccess(); 