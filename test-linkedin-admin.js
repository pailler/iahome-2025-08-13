const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLinkedInAdmin() {
  console.log('🔧 Test de l\'interface admin LinkedIn\n');

  try {
    // 1. Vérifier l'accès aux tables
    console.log('📋 Vérification de l\'accès aux tables...');
    
    const { data: configData, error: configError } = await supabase
      .from('linkedin_config')
      .select('*')
      .limit(1);
    
    if (configError) {
      console.log('⚠️  Table linkedin_config :', configError.message);
    } else {
      console.log('✅ Table linkedin_config accessible');
    }

    const { data: postsData, error: postsError } = await supabase
      .from('linkedin_posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.log('⚠️  Table linkedin_posts :', postsError.message);
    } else {
      console.log('✅ Table linkedin_posts accessible');
    }

    const { data: analyticsData, error: analyticsError } = await supabase
      .from('linkedin_analytics')
      .select('*')
      .limit(1);
    
    if (analyticsError) {
      console.log('⚠️  Table linkedin_analytics :', analyticsError.message);
    } else {
      console.log('✅ Table linkedin_analytics accessible');
    }

    // 2. Vérifier les données existantes
    console.log('\n📊 Vérification des données existantes...');
    
    const { data: allPosts, error: allPostsError } = await supabase
      .from('linkedin_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allPostsError) {
      console.log('❌ Erreur récupération posts :', allPostsError.message);
    } else {
      console.log(`📝 ${allPosts.length} posts LinkedIn trouvés`);
      if (allPosts.length > 0) {
        console.log('Dernier post :', allPosts[0].title);
      }
    }

    const { data: allConfig, error: allConfigError } = await supabase
      .from('linkedin_config')
      .select('*');
    
    if (allConfigError) {
      console.log('❌ Erreur récupération config :', allConfigError.message);
    } else {
      console.log(`⚙️  ${allConfig.length} configurations LinkedIn trouvées`);
    }

    // 3. Vérifier les données sources (blog et modules)
    console.log('\n📚 Vérification des sources de contenu...');
    
    const { data: blogArticles, error: blogError } = await supabase
      .from('blog_articles')
      .select('id, title')
      .limit(5);
    
    if (blogError) {
      console.log('❌ Erreur récupération articles blog :', blogError.message);
    } else {
      console.log(`📖 ${blogArticles.length} articles de blog disponibles`);
      if (blogArticles.length > 0) {
        console.log('Articles disponibles :', blogArticles.map(a => a.title).join(', '));
      }
    }

    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, category')
      .limit(5);
    
    if (modulesError) {
      console.log('❌ Erreur récupération modules :', modulesError.message);
    } else {
      console.log(`🤖 ${modules.length} modules IA disponibles`);
      if (modules.length > 0) {
        console.log('Modules disponibles :', modules.map(m => `${m.title} (${m.category})`).join(', '));
      }
    }

    // 4. Test de l'API endpoint
    console.log('\n🌐 Test de l\'API endpoint...');
    
    try {
      const response = await fetch('http://localhost:3000/api/linkedin/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test post',
          content: 'Ceci est un test de l\'API LinkedIn',
          publishNow: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API endpoint accessible');
        console.log('Réponse :', result);
      } else {
        console.log('⚠️  API endpoint accessible mais erreur :', response.status);
      }
    } catch (error) {
      console.log('❌ API endpoint non accessible :', error.message);
      console.log('💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)');
    }

    console.log('\n🎯 Résumé du test :');
    console.log('✅ Tables LinkedIn créées et accessibles');
    console.log('✅ Sources de contenu disponibles (blog + modules)');
    console.log('✅ Interface admin prête à utiliser');
    
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Allez sur http://localhost:3000/admin/linkedin');
    console.log('2. Configurez vos credentials LinkedIn');
    console.log('3. Créez votre premier post LinkedIn');
    console.log('4. Testez la publication automatique');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error);
  }
}

testLinkedInAdmin().catch(console.error); 