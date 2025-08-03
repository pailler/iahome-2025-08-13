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

async function testChatWithData() {
  console.log('🧪 Test du chat IA avec accès aux données...\n');

  try {
    // 1. Tester la récupération des articles de blog
    console.log('📝 Test récupération articles de blog...');
    const { data: articles, error: articlesError } = await supabase
      .from('blog_articles')
      .select('title, content, category, is_published')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (articlesError) {
      console.log('❌ Erreur articles:', articlesError.message);
    } else {
      console.log(`✅ ${articles?.length || 0} articles trouvés`);
      if (articles && articles.length > 0) {
        articles.forEach(article => {
          console.log(`   - ${article.title} (${article.category})`);
        });
      }
    }

    // 2. Tester la récupération des modules
    console.log('\n🔧 Test récupération modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('title, description, category, price')
      .order('title', { ascending: true });

    if (modulesError) {
      console.log('❌ Erreur modules:', modulesError.message);
    } else {
      console.log(`✅ ${modules?.length || 0} modules trouvés`);
      if (modules && modules.length > 0) {
        modules.forEach(module => {
          console.log(`   - ${module.title} (${module.category}, ${module.price}€)`);
        });
      }
    }

    // 3. Tester l'API de chat
    console.log('\n🤖 Test de l\'API de chat...');
    const testMessage = "Peux-tu me parler des modules disponibles et des articles de blog ?";
    
    const response = await fetch('http://localhost:8021/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        userId: 'test-user-id',
        conversationHistory: []
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse de l\'API de chat:');
      console.log('📄 Message:', testMessage);
      console.log('🤖 Réponse:', data.response.substring(0, 200) + '...');
    } else {
      console.log('❌ Erreur API de chat:', response.status, response.statusText);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }

  console.log('\n✨ Test terminé');
  console.log('\n💡 Votre chat IA peut maintenant :');
  console.log('   - Récupérer et expliquer les articles de blog');
  console.log('   - Décrire les modules disponibles');
  console.log('   - Fournir des informations précises sur les prix');
  console.log('   - Répondre avec des données réelles de votre plateforme');
}

// Exécuter le test
testChatWithData().catch(console.error); 