const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLinkedInIntegration() {
  console.log('Test de l\'intégration LinkedIn...\n');

  try {
    console.log('Vérification des tables LinkedIn...');
    
    const { data: config, error: configError } = await supabase
      .from('linkedin_config')
      .select('*')
      .limit(1);

    if (configError) {
      console.log('Table linkedin_config non accessible:', configError.message);
    } else {
      console.log('Table linkedin_config accessible');
    }

    const { data: posts, error: postsError } = await supabase
      .from('linkedin_posts')
      .select('*')
      .limit(1);

    if (postsError) {
      console.log('Table linkedin_posts non accessible:', postsError.message);
    } else {
      console.log('Table linkedin_posts accessible');
    }

    console.log('\nCréation d\'un post de test...');
    const testPost = {
      title: 'Test intégration LinkedIn',
      content: 'Ceci est un test de l\'intégration LinkedIn avec IAhome',
      status: 'draft',
      source_type: 'manual'
    };

    const { data: newPost, error: insertError } = await supabase
      .from('linkedin_posts')
      .insert(testPost)
      .select()
      .single();

    if (insertError) {
      console.log('Erreur création post:', insertError.message);
    } else {
      console.log('Post de test créé:', newPost.id);
    }

    console.log('\nRécupération des posts LinkedIn...');
    const { data: allPosts, error: allPostsError } = await supabase
      .from('linkedin_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (allPostsError) {
      console.log('Erreur récupération posts:', allPostsError.message);
    } else {
      console.log(allPosts?.length || 0, 'posts trouvés');
      if (allPosts && allPosts.length > 0) {
        allPosts.forEach((post, index) => {
          console.log(index + 1 + '.', post.title, '(', post.status + ')');
        });
      }
    }

  } catch (error) {
    console.error('Erreur générale:', error);
  }

  console.log('\nTest terminé');
  console.log('\nProchaines étapes :');
  console.log('1. Configurez votre compte LinkedIn dans l\'interface admin');
  console.log('2. Testez la publication réelle sur LinkedIn');
  console.log('3. Configurez la programmation automatique');
}

testLinkedInIntegration().catch(console.error);
