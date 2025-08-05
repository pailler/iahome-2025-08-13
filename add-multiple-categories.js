const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMultipleCategories() {
  try {
    console.log('🚀 Ajout de catégories multiples aux modules...\n');

    // 1. Récupérer tous les modules
    console.log('📋 Récupération des modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, category, description')
      .order('title');

    if (modulesError) {
      console.error('❌ Erreur lors de la récupération des modules:', modulesError);
      return;
    }

    console.log(`📊 Nombre de modules: ${modules.length}\n`);

    // 2. Définir les règles de catégories multiples
    const categoryRules = [
      {
        keywords: ['chatgpt', 'claude', 'bard', 'assistant', 'formation', 'apprendre', 'tutoriel', 'cours', 'formation'],
        category: 'IA FORMATION'
      },
      {
        keywords: ['code', 'programmation', 'développement', 'api', 'github', 'git', 'terminal', 'script', 'dev', 'coding'],
        category: 'IA DEVELOPPEMENT'
      },
      {
        keywords: ['psi', 'transfer', 'file', 'upload', 'download', 'share', 'fichier'],
        category: 'Web Tools'
      },
      {
        keywords: ['photo', 'image', 'img', 'picture', 'photography'],
        category: 'IA PHOTO'
      },
      {
        keywords: ['video', 'vidéo', 'youtube', 'streaming', 'media'],
        category: 'IA VIDEO'
      },
      {
        keywords: ['audio', 'music', 'musique', 'sound', 'mao'],
        category: 'IA MAO'
      },
      {
        keywords: ['marketing', 'seo', 'publicité', 'ads', 'campaign'],
        category: 'IA MARKETING'
      },
      {
        keywords: ['design', 'graphic', 'création', 'art', 'creative'],
        category: 'IA DESIGN'
      },
      {
        keywords: ['bureautique', 'office', 'document', 'pdf', 'word', 'excel'],
        category: 'IA BUREAUTIQUE'
      },
      {
        keywords: ['prompt', 'prompts', 'template', 'modèle'],
        category: 'IA PROMPTS'
      },
      {
        keywords: ['assistant', 'ai', 'intelligence', 'chat', 'bot'],
        category: 'IA ASSISTANT'
      }
    ];

    // 3. Ajouter les catégories multiples
    console.log('🔄 Ajout des catégories multiples...');
    let addedCount = 0;

    for (const module of modules) {
      const moduleTitle = module.title.toLowerCase();
      const moduleDescription = (module.description || '').toLowerCase();
      const categoriesToAdd = [];

      // Vérifier chaque règle
      for (const rule of categoryRules) {
        const hasKeyword = rule.keywords.some(keyword => 
          moduleTitle.includes(keyword.toLowerCase()) ||
          moduleDescription.includes(keyword.toLowerCase())
        );
        
        if (hasKeyword) {
          categoriesToAdd.push(rule.category);
        }
      }

      // Ajouter les nouvelles catégories
      for (const category of categoriesToAdd) {
        console.log(`  - ${module.title}: +${category}`);
        
        const { error: insertError } = await supabase
          .from('module_categories')
          .insert({
            module_id: module.id,
            category: category
          });

        if (insertError) {
          if (insertError.code === '23505') {
            console.log(`    ⚠️ Catégorie ${category} déjà existante`);
          } else {
            console.error(`    ❌ Erreur:`, insertError);
          }
        } else {
          addedCount++;
          console.log(`    ✅ Catégorie ${category} ajoutée`);
        }
      }
    }

    console.log(`\n📊 Ajout terminé: ${addedCount} nouvelles catégories ajoutées`);

    // 4. Afficher le résultat final
    console.log('\n📋 Résumé des catégories par module:');
    const { data: allCategories, error: allCategoriesError } = await supabase
      .from('module_categories')
      .select(`
        module_id,
        category,
        modules!inner(title)
      `)
      .order('modules.title');

    if (allCategoriesError) {
      console.error('❌ Erreur lors de la récupération:', allCategoriesError);
      return;
    }

    const moduleCategories = {};
    allCategories.forEach(item => {
      const title = item.modules.title;
      if (!moduleCategories[title]) {
        moduleCategories[title] = [];
      }
      moduleCategories[title].push(item.category);
    });

    Object.entries(moduleCategories).forEach(([title, categories]) => {
      console.log(`  - ${title}: ${categories.join(', ')}`);
    });

    console.log('\n✅ Opération terminée avec succès !');
    console.log('💡 Les modules peuvent maintenant avoir plusieurs catégories');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
addMultipleCategories(); 