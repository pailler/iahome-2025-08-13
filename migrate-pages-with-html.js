const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Contenu HTML pour les pages existantes
const pagesWithHTML = [
  {
    slug: 'home',
    title: 'Accueil',
    description: 'Page d\'accueil d\'IAhome - Votre plateforme d\'outils IA',
    content: `
<div class="hero-section bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
  <div class="container mx-auto px-6">
    <div class="text-center">
      <h1 class="text-5xl font-bold mb-6">Accès direct à la puissance et aux outils IA</h1>
      <p class="text-xl mb-8">Build with ready-made apps and templates created by the Bubble community.</p>
      <div class="max-w-md mx-auto">
        <div class="relative">
          <input type="text" placeholder="Search for a template" class="w-full px-4 py-3 rounded-lg text-gray-900">
          <button class="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="filters-section bg-gray-50 py-8">
  <div class="container mx-auto px-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex gap-4">
        <select class="px-4 py-2 border border-gray-300 rounded-lg">
          <option>Free and paid</option>
        </select>
        <select class="px-4 py-2 border border-gray-300 rounded-lg">
          <option>All experience levels</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Sort by:</span>
        <select class="px-4 py-2 border border-gray-300 rounded-lg">
          <option>Most installed</option>
        </select>
      </div>
    </div>
  </div>
</div>

<div class="content-section py-12">
  <div class="container mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="mb-4">
          <span class="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">BUILDING BLOCKS</span>
        </div>
        <h3 class="text-lg font-semibold text-blue-900 mb-2">Canvas Building Framework</h3>
        <p class="text-gray-600 mb-4">Un framework puissant pour construire des applications web modernes avec des composants réutilisables.</p>
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold text-blue-900">€29</span>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Installer</button>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="mb-4">
          <span class="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">AI TOOLS</span>
        </div>
        <h3 class="text-lg font-semibold text-blue-900 mb-2">IA Assistant Pro</h3>
        <p class="text-gray-600 mb-4">Assistant IA avancé pour automatiser vos tâches quotidiennes et améliorer votre productivité.</p>
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold text-blue-900">€49</span>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Installer</button>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="mb-4">
          <span class="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">PRODUCTIVITY</span>
        </div>
        <h3 class="text-lg font-semibold text-blue-900 mb-2">Task Manager Plus</h3>
        <p class="text-gray-600 mb-4">Gestionnaire de tâches intelligent avec intégration IA pour optimiser votre workflow.</p>
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold text-blue-900">€19</span>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Installer</button>
        </div>
      </div>
    </div>
  </div>
</div>`,
    is_published: true,
    is_homepage: true,
    meta_title: 'IAhome - Plateforme d\'outils IA',
    meta_description: 'Découvrez notre collection d\'outils IA pour améliorer votre productivité et automatiser vos tâches.'
  },
  {
    slug: 'community',
    title: 'Communauté',
    description: 'Rejoignez notre communauté d\'utilisateurs IA',
    content: `
<div class="hero-section bg-gradient-to-r from-green-600 to-teal-700 text-white py-20">
  <div class="container mx-auto px-6">
    <div class="text-center">
      <h1 class="text-5xl font-bold mb-6">Rejoignez notre communauté IA</h1>
      <p class="text-xl mb-8">Connectez-vous avec d'autres passionnés d'intelligence artificielle</p>
    </div>
  </div>
</div>

<div class="content-section py-12">
  <div class="container mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Pourquoi rejoindre notre communauté ?</h2>
        <ul class="space-y-4">
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700">Partagez vos expériences avec les outils IA</span>
          </li>
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700">Découvrez de nouveaux outils et techniques</span>
          </li>
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700">Obtenez de l'aide et des conseils d'experts</span>
          </li>
          <li class="flex items-start">
            <svg class="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-700">Participez à des événements et webinaires</span>
          </li>
        </ul>
      </div>
      
      <div class="bg-gray-50 rounded-lg p-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Statistiques de la communauté</h3>
        <div class="grid grid-cols-2 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">1,250+</div>
            <div class="text-gray-600">Membres actifs</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">500+</div>
            <div class="text-gray-600">Outils partagés</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">50+</div>
            <div class="text-gray-600">Événements organisés</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600">24/7</div>
            <div class="text-gray-600">Support disponible</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
    is_published: true,
    is_homepage: false,
    meta_title: 'Communauté IAhome - Rejoignez notre communauté',
    meta_description: 'Connectez-vous avec d\'autres passionnés d\'IA, partagez vos expériences et découvrez de nouveaux outils.'
  },
  {
    slug: 'blog',
    title: 'Blog',
    description: 'Actualités et articles sur l\'intelligence artificielle',
    content: `
<div class="hero-section bg-gradient-to-r from-purple-600 to-pink-700 text-white py-20">
  <div class="container mx-auto px-6">
    <div class="text-center">
      <h1 class="text-5xl font-bold mb-6">Blog IAhome</h1>
      <p class="text-xl mb-8">Actualités, tutoriels et insights sur l'intelligence artificielle</p>
    </div>
  </div>
</div>

<div class="content-section py-12">
  <div class="container mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <article class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">IA</span>
            <span class="text-gray-500 text-sm ml-2">Il y a 2 jours</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Les tendances IA en 2024</h3>
          <p class="text-gray-600 mb-4">Découvrez les technologies d'intelligence artificielle qui vont révolutionner l'industrie cette année.</p>
          <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Lire la suite →</a>
        </div>
      </article>
      
      <article class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Tutoriel</span>
            <span class="text-gray-500 text-sm ml-2">Il y a 1 semaine</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Comment intégrer l'IA dans votre workflow</h3>
          <p class="text-gray-600 mb-4">Guide pratique pour intégrer efficacement les outils d'IA dans vos processus quotidiens.</p>
          <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Lire la suite →</a>
        </div>
      </article>
      
      <article class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Innovation</span>
            <span class="text-gray-500 text-sm ml-2">Il y a 2 semaines</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">L'avenir du travail avec l'IA</h3>
          <p class="text-gray-600 mb-4">Comment l'intelligence artificielle va transformer le monde du travail dans les années à venir.</p>
          <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Lire la suite →</a>
        </div>
      </article>
    </div>
  </div>
</div>`,
    is_published: true,
    is_homepage: false,
    meta_title: 'Blog IAhome - Actualités et articles IA',
    meta_description: 'Découvrez les dernières actualités, tutoriels et insights sur l\'intelligence artificielle.'
  },
  {
    slug: 'about',
    title: 'À propos',
    description: 'Découvrez notre mission et notre équipe',
    content: `
<div class="hero-section bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-20">
  <div class="container mx-auto px-6">
    <div class="text-center">
      <h1 class="text-5xl font-bold mb-6">À propos d'IAhome</h1>
      <p class="text-xl mb-8">Votre plateforme de référence pour les outils d'intelligence artificielle</p>
    </div>
  </div>
</div>

<div class="content-section py-12">
  <div class="container mx-auto px-6">
    <div class="max-w-4xl mx-auto">
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Notre mission</h2>
        <p class="text-lg text-gray-700 leading-relaxed">
          Chez IAhome, nous croyons que l'intelligence artificielle doit être accessible à tous. 
          Notre mission est de démocratiser l'accès aux outils IA en proposant une plateforme 
          simple, intuitive et complète pour tous les utilisateurs, qu'ils soient débutants ou experts.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
          <p class="text-gray-600">Nous repoussons constamment les limites de la technologie IA</p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Communauté</h3>
          <p class="text-gray-600">Nous construisons ensemble l'avenir de l'IA</p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Sécurité</h3>
          <p class="text-gray-600">Vos données et votre vie privée sont notre priorité</p>
        </div>
      </div>
      
      <div class="bg-gray-50 rounded-lg p-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Notre équipe</h2>
        <p class="text-lg text-gray-700 mb-6">
          Notre équipe est composée d'experts passionnés par l'intelligence artificielle, 
          le développement web et l'expérience utilisateur. Nous travaillons ensemble 
          pour créer la meilleure plateforme possible.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-500 rounded-full mr-4"></div>
            <div>
              <h4 class="font-bold text-gray-900">Jean Dupont</h4>
              <p class="text-gray-600">CEO & Fondateur</p>
            </div>
          </div>
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-500 rounded-full mr-4"></div>
            <div>
              <h4 class="font-bold text-gray-900">Marie Martin</h4>
              <p class="text-gray-600">CTO & Lead Developer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
    is_published: true,
    is_homepage: false,
    meta_title: 'À propos d\'IAhome - Notre mission et équipe',
    meta_description: 'Découvrez notre mission de démocratiser l\'accès aux outils IA et rencontrez notre équipe passionnée.'
  }
];

async function migratePagesWithHTML() {
  try {
    console.log('🚀 Migration des pages avec contenu HTML...\n');

    for (const pageData of pagesWithHTML) {
      console.log(`📝 Traitement de la page: ${pageData.title}`);
      
      // Vérifier si la page existe déjà
      const { data: existingPage, error: checkError } = await supabase
        .from('pages')
        .select('id, title')
        .eq('slug', pageData.slug)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Erreur lors de la vérification de ${pageData.slug}:`, checkError);
        continue;
      }

      if (existingPage) {
        // Mettre à jour la page existante
        console.log(`  🔄 Mise à jour de la page existante: ${existingPage.title}`);
        const { error: updateError } = await supabase
          .from('pages')
          .update({
            title: pageData.title,
            description: pageData.description,
            content: pageData.content,
            is_published: pageData.is_published,
            is_homepage: pageData.is_homepage,
            meta_title: pageData.meta_title,
            meta_description: pageData.meta_description
          })
          .eq('id', existingPage.id);

        if (updateError) {
          console.error(`❌ Erreur lors de la mise à jour de ${pageData.slug}:`, updateError);
        } else {
          console.log(`✅ Page mise à jour: ${pageData.title}`);
        }
      } else {
        // Créer une nouvelle page
        console.log(`  ➕ Création d'une nouvelle page: ${pageData.title}`);
        const { error: insertError } = await supabase
          .from('pages')
          .insert([pageData]);

        if (insertError) {
          console.error(`❌ Erreur lors de la création de ${pageData.slug}:`, insertError);
        } else {
          console.log(`✅ Page créée: ${pageData.title}`);
        }
      }
    }

    // Afficher les pages finales
    console.log('\n📋 Pages dans la base de données:');
    const { data: finalPages, error: finalError } = await supabase
      .from('pages')
      .select('slug, title, is_published, is_homepage')
      .order('slug');

    if (finalError) {
      console.error('❌ Erreur lors de la récupération finale:', finalError);
    } else {
      finalPages.forEach(page => {
        const status = page.is_published ? '✅' : '❌';
        const homepage = page.is_homepage ? '🏠' : '';
        console.log(`  ${status} ${page.title} (/${page.slug}) ${homepage}`);
      });
    }

    console.log('\n🎉 Migration terminée avec succès !');
    console.log('💡 Les pages sont maintenant disponibles dans l\'administration.');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la migration
migratePagesWithHTML(); 