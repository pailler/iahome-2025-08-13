require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleArticles = [
  {
    title: "Introduction à l'Intelligence Artificielle",
    slug: "introduction-intelligence-artificielle",
    content: `
      <h2>Qu'est-ce que l'Intelligence Artificielle ?</h2>
      <p>L'intelligence artificielle (IA) est un domaine de l'informatique qui vise à créer des systèmes capables d'effectuer des tâches qui nécessitent normalement l'intelligence humaine.</p>
      
      <h2>Les différents types d'IA</h2>
      <ul>
        <li><strong>IA faible (ANI)</strong> : Spécialisée dans une tâche spécifique</li>
        <li><strong>IA générale (AGI)</strong> : Capable de comprendre et d'apprendre n'importe quelle tâche intellectuelle</li>
        <li><strong>IA superintelligente (ASI)</strong> : Dépassant l'intelligence humaine</li>
      </ul>
      
      <h2>Applications courantes</h2>
      <p>L'IA est utilisée dans de nombreux domaines :</p>
      <ul>
        <li>Reconnaissance vocale et traitement du langage naturel</li>
        <li>Vision par ordinateur et reconnaissance d'images</li>
        <li>Systèmes de recommandation</li>
        <li>Voitures autonomes</li>
        <li>Diagnostic médical</li>
      </ul>
      
      <h2>L'avenir de l'IA</h2>
      <p>L'IA continue d'évoluer rapidement et promet de transformer notre façon de vivre et de travailler. Il est important de comprendre ses implications éthiques et sociales.</p>
    `,
    excerpt: "Découvrez les bases de l'intelligence artificielle, ses différents types et ses applications dans notre quotidien.",
    category: "resources",
    author: "Équipe IAHome",
    read_time: 8,
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&auto=format"
  },
  {
    title: "Les meilleurs outils IA pour les développeurs",
    slug: "meilleurs-outils-ia-developpeurs",
    content: `
      <h2>Outils de génération de code</h2>
      <p>Les outils IA révolutionnent la façon dont les développeurs écrivent du code :</p>
      <ul>
        <li><strong>GitHub Copilot</strong> : Assistant de programmation alimenté par l'IA</li>
        <li><strong>Tabnine</strong> : Autocomplétion intelligente du code</li>
        <li><strong>CodeWhisperer</strong> : Solution d'Amazon pour la génération de code</li>
      </ul>
      
      <h2>Outils de test et débogage</h2>
      <p>L'IA aide également dans les tests et le débogage :</p>
      <ul>
        <li>Génération automatique de tests unitaires</li>
        <li>Détection automatique de bugs</li>
        <li>Optimisation des performances</li>
      </ul>
      
      <h2>Outils de documentation</h2>
      <p>Générer une documentation claire et à jour :</p>
      <ul>
        <li>Génération automatique de commentaires</li>
        <li>Création de documentation technique</li>
        <li>Traduction automatique de la documentation</li>
      </ul>
      
      <h2>Conseils d'utilisation</h2>
      <p>Pour tirer le meilleur parti de ces outils :</p>
      <ol>
        <li>Commencez par des tâches simples</li>
        <li>Vérifiez toujours le code généré</li>
        <li>Utilisez ces outils comme assistants, pas comme remplaçants</li>
        <li>Restez à jour avec les nouvelles fonctionnalités</li>
      </ol>
    `,
    excerpt: "Découvrez les outils d'intelligence artificielle les plus utiles pour améliorer votre productivité en tant que développeur.",
    category: "product",
    author: "Équipe IAHome",
    read_time: 6,
    image_url: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop&auto=format"
  },
  {
    title: "Comment intégrer l'IA dans votre entreprise",
    slug: "integrer-ia-entreprise",
    content: `
      <h2>Évaluation de la maturité IA</h2>
      <p>Avant d'intégrer l'IA, évaluez la maturité de votre organisation :</p>
      <ul>
        <li>Disponibilité des données</li>
        <li>Expertise technique</li>
        <li>Budget et ressources</li>
        <li>Culture d'entreprise</li>
      </ul>
      
      <h2>Stratégies d'implémentation</h2>
      <h3>1. Commencer petit</h3>
      <p>Identifiez des cas d'usage simples et à forte valeur ajoutée.</p>
      
      <h3>2. Construire une équipe</h3>
      <p>Formez ou recrutez des experts en IA et en science des données.</p>
      
      <h3>3. Investir dans l'infrastructure</h3>
      <p>Mettez en place une infrastructure cloud adaptée aux besoins de l'IA.</p>
      
      <h2>Cas d'usage populaires</h2>
      <ul>
        <li><strong>Service client</strong> : Chatbots et assistants virtuels</li>
        <li><strong>Marketing</strong> : Personnalisation et recommandations</li>
        <li><strong>Opérations</strong> : Maintenance prédictive et optimisation</li>
        <li><strong>Finance</strong> : Détection de fraude et analyse de risque</li>
      </ul>
      
      <h2>Mesurer le succès</h2>
      <p>Définissez des métriques claires pour mesurer l'impact de vos initiatives IA :</p>
      <ul>
        <li>ROI et économies réalisées</li>
        <li>Amélioration de la productivité</li>
        <li>Satisfaction client</li>
        <li>Innovation et avantage concurrentiel</li>
      </ul>
    `,
    excerpt: "Guide complet pour intégrer l'intelligence artificielle dans votre entreprise de manière efficace et stratégique.",
    category: "enterprise",
    author: "Équipe IAHome",
    read_time: 10,
    image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&auto=format"
  },
  {
    title: "Éthique et responsabilité dans l'IA",
    slug: "ethique-responsabilite-ia",
    content: `
      <h2>Les défis éthiques de l'IA</h2>
      <p>L'IA soulève de nombreuses questions éthiques importantes :</p>
      <ul>
        <li><strong>Biais algorithmiques</strong> : Comment éviter la discrimination ?</li>
        <li><strong>Transparence</strong> : Comment rendre les décisions IA compréhensibles ?</li>
        <li><strong>Responsabilité</strong> : Qui est responsable des erreurs de l'IA ?</li>
        <li><strong>Vie privée</strong> : Comment protéger les données personnelles ?</li>
      </ul>
      
      <h2>Principes éthiques fondamentaux</h2>
      <h3>1. Équité</h3>
      <p>Les systèmes IA doivent être équitables et ne pas discriminer.</p>
      
      <h3>2. Transparence</h3>
      <p>Les processus de décision doivent être compréhensibles et traçables.</p>
      
      <h3>3. Responsabilité</h3>
      <p>Les développeurs et utilisateurs doivent être responsables des impacts.</p>
      
      <h3>4. Confidentialité</h3>
      <p>La protection des données personnelles est primordiale.</p>
      
      <h2>Bonnes pratiques</h2>
      <ul>
        <li>Diversifier les équipes de développement</li>
        <li>Effectuer des audits de biais réguliers</li>
        <li>Impliquer les parties prenantes</li>
        <li>Documenter les décisions éthiques</li>
        <li>Former les équipes à l'éthique de l'IA</li>
      </ul>
      
      <h2>Cadres réglementaires</h2>
      <p>Suivez les réglementations en vigueur :</p>
      <ul>
        <li>RGPD en Europe</li>
        <li>Directives sectorielles spécifiques</li>
        <li>Standards internationaux</li>
      </ul>
    `,
    excerpt: "Explorez les enjeux éthiques de l'intelligence artificielle et les bonnes pratiques pour développer des systèmes IA responsables.",
    category: "community",
    author: "Équipe IAHome",
    read_time: 7,
    image_url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop&auto=format"
  }
];

async function createSampleArticles() {
  console.log('📝 Création d\'articles de test pour le blog');
  console.log('============================================\n');
  
  try {
    for (const article of sampleArticles) {
      console.log(`📄 Création de l'article : "${article.title}"`);
      
      const { data, error } = await supabase
        .from('blog_articles')
        .insert({
          ...article,
          published_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error(`❌ Erreur lors de la création de "${article.title}":`, error);
      } else {
        console.log(`✅ Article créé avec succès : ${data[0].id}`);
      }
    }
    
    console.log('\n🎉 Création des articles terminée !');
    console.log('Vous pouvez maintenant visiter https://home.regispailler.fr/blog pour voir les articles.');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

createSampleArticles(); 