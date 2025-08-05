const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Définition des pages statiques existantes
const staticPages = [
  {
    slug: 'home',
    title: 'Accueil - IAhome',
    description: 'Plateforme d\'accès aux outils et applications d\'intelligence artificielle',
    content: 'Page d\'accueil principale de la plateforme IAhome',
    is_published: true,
    is_homepage: true,
    meta_title: 'IAhome - Plateforme IA',
    meta_description: 'Accès direct à la puissance et aux outils IA. Build with ready-made apps and templates created by the Bubble community.'
  },
  {
    slug: 'community',
    title: 'Construire une communauté IA engagée',
    description: 'Créez et animez une communauté dynamique qui accélère l\'adoption de l\'IA',
    content: 'Guide complet pour construire et animer une communauté IA efficace',
    is_published: true,
    is_homepage: false,
    meta_title: 'Communauté IA - IAhome',
    meta_description: 'Découvrez comment créer et animer une communauté IA dynamique qui accélère la transformation numérique de votre entreprise.'
  },
  {
    slug: 'blog',
    title: 'Blog IAHome',
    description: 'L\'intelligence artificielle : les outils, les ressources et les meilleures pratiques',
    content: 'Blog dédié à l\'intelligence artificielle avec articles, tutoriels et ressources',
    is_published: true,
    is_homepage: false,
    meta_title: 'Blog IA - IAhome',
    meta_description: 'Articles, tutoriels et ressources sur l\'intelligence artificielle et ses applications.'
  },
  {
    slug: 'modules',
    title: 'Mes applis d\'accès',
    description: 'Accédez directement à vos applis autorisées',
    content: 'Page de gestion des applications et modules accessibles à l\'utilisateur',
    is_published: true,
    is_homepage: false,
    meta_title: 'Mes applis - IAhome',
    meta_description: 'Accédez directement à vos applications d\'intelligence artificielle autorisées.'
  },
  {
    slug: 'login',
    title: 'Connexion - IAhome',
    description: 'Connectez-vous à votre compte IAhome',
    content: 'Page de connexion et d\'inscription à la plateforme',
    is_published: true,
    is_homepage: false,
    meta_title: 'Connexion - IAhome',
    meta_description: 'Connectez-vous à votre compte IAhome pour accéder aux outils d\'intelligence artificielle.'
  },
  {
    slug: 'register',
    title: 'Inscription - IAhome',
    description: 'Créez votre compte IAhome',
    content: 'Page d\'inscription à la plateforme IAhome',
    is_published: true,
    is_homepage: false,
    meta_title: 'Inscription - IAhome',
    meta_description: 'Créez votre compte IAhome pour accéder aux outils d\'intelligence artificielle.'
  },
  {
    slug: 'admin',
    title: 'Administration - IAhome',
    description: 'Interface d\'administration de la plateforme',
    content: 'Dashboard d\'administration pour la gestion des utilisateurs, modules et contenus',
    is_published: true,
    is_homepage: false,
    meta_title: 'Administration - IAhome',
    meta_description: 'Interface d\'administration pour la gestion de la plateforme IAhome.'
  },
  {
    slug: 'success',
    title: 'Paiement réussi - IAhome',
    description: 'Votre paiement a été traité avec succès',
    content: 'Page de confirmation de paiement réussi',
    is_published: true,
    is_homepage: false,
    meta_title: 'Paiement réussi - IAhome',
    meta_description: 'Confirmation de votre paiement et accès à vos services.'
  },
  {
    slug: 'cancel',
    title: 'Paiement annulé - IAhome',
    description: 'Votre paiement a été annulé',
    content: 'Page d\'annulation de paiement',
    is_published: true,
    is_homepage: false,
    meta_title: 'Paiement annulé - IAhome',
    meta_description: 'Votre paiement a été annulé. Vous pouvez réessayer à tout moment.'
  },
  {
    slug: 'about',
    title: 'À propos - IAhome',
    description: 'Découvrez IAhome et notre mission',
    content: 'Page de présentation de la plateforme IAhome et de son équipe',
    is_published: true,
    is_homepage: false,
    meta_title: 'À propos - IAhome',
    meta_description: 'Découvrez IAhome, notre mission et notre équipe dédiée à l\'intelligence artificielle.'
  },
  {
    slug: 'contact',
    title: 'Contact - IAhome',
    description: 'Contactez l\'équipe IAhome',
    content: 'Page de contact et support de la plateforme',
    is_published: true,
    is_homepage: false,
    meta_title: 'Contact - IAhome',
    meta_description: 'Contactez l\'équipe IAhome pour toute question ou support.'
  },
  {
    slug: 'pricing',
    title: 'Tarifs - IAhome',
    description: 'Découvrez nos offres et tarifs',
    content: 'Page présentant les différents plans et tarifs de la plateforme',
    is_published: true,
    is_homepage: false,
    meta_title: 'Tarifs - IAhome',
    meta_description: 'Découvrez nos offres et tarifs pour accéder aux outils d\'intelligence artificielle.'
  },
  {
    slug: 'privacy',
    title: 'Politique de confidentialité - IAhome',
    description: 'Notre politique de confidentialité et protection des données',
    content: 'Politique de confidentialité et protection des données personnelles',
    is_published: true,
    is_homepage: false,
    meta_title: 'Politique de confidentialité - IAhome',
    meta_description: 'Notre politique de confidentialité et protection des données personnelles.'
  },
  {
    slug: 'terms',
    title: 'Conditions d\'utilisation - IAhome',
    description: 'Conditions générales d\'utilisation de la plateforme',
    content: 'Conditions générales d\'utilisation de la plateforme IAhome',
    is_published: true,
    is_homepage: false,
    meta_title: 'Conditions d\'utilisation - IAhome',
    meta_description: 'Conditions générales d\'utilisation de la plateforme IAhome.'
  }
];

async function migrateStaticPages() {
  console.log('🚀 Début de la migration des pages statiques...\n');

  try {
    // Vérifier si la table pages existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('pages')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table pages:', tableError);
      console.log('💡 Assurez-vous d\'avoir exécuté le script setup-menu-system.js en premier');
      return;
    }

    console.log('✅ Table pages trouvée\n');

    // Vérifier les pages existantes
    const { data: existingPages, error: existingError } = await supabase
      .from('pages')
      .select('slug, title');

    if (existingError) {
      console.error('❌ Erreur lors de la récupération des pages existantes:', existingError);
      return;
    }

    const existingSlugs = existingPages.map(page => page.slug);
    console.log(`📊 Pages existantes: ${existingPages.length}`);
    existingPages.forEach(page => console.log(`  - ${page.slug}: ${page.title}`));

    // Filtrer les nouvelles pages à ajouter
    const newPages = staticPages.filter(page => !existingSlugs.includes(page.slug));
    
    if (newPages.length === 0) {
      console.log('\n✅ Toutes les pages statiques sont déjà migrées !');
      return;
    }

    console.log(`\n📝 Pages à migrer: ${newPages.length}`);
    newPages.forEach(page => console.log(`  - ${page.slug}: ${page.title}`));

    // Insérer les nouvelles pages
    const { data: insertedPages, error: insertError } = await supabase
      .from('pages')
      .insert(newPages)
      .select('slug, title');

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion des pages:', insertError);
      return;
    }

    console.log('\n✅ Migration réussie !');
    console.log(`📊 ${insertedPages.length} pages migrées:`);
    insertedPages.forEach(page => console.log(`  - ${page.slug}: ${page.title}`));

    // Afficher le résumé final
    const { data: allPages, error: finalError } = await supabase
      .from('pages')
      .select('slug, title, is_published, is_homepage')
      .order('slug');

    if (!finalError) {
      console.log('\n📋 Résumé complet des pages:');
      allPages.forEach(page => {
        const status = page.is_homepage ? '🏠' : (page.is_published ? '✅' : '⏸️');
        console.log(`  ${status} ${page.slug}: ${page.title}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Fonction pour mettre à jour les pages existantes
async function updateExistingPages() {
  console.log('🔄 Mise à jour des pages existantes...\n');

  try {
    for (const page of staticPages) {
      const { data, error } = await supabase
        .from('pages')
        .update({
          title: page.title,
          description: page.description,
          content: page.content,
          meta_title: page.meta_title,
          meta_description: page.meta_description
        })
        .eq('slug', page.slug)
        .select('slug, title');

      if (error) {
        console.error(`❌ Erreur lors de la mise à jour de ${page.slug}:`, error);
      } else if (data && data.length > 0) {
        console.log(`✅ ${page.slug} mis à jour: ${page.title}`);
      }
    }

    console.log('\n✅ Mise à jour terminée !');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  }
}

// Fonction pour afficher les statistiques
async function showStats() {
  console.log('📊 Statistiques des pages...\n');

  try {
    const { data: pages, error } = await supabase
      .from('pages')
      .select('*');

    if (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return;
    }

    const published = pages.filter(p => p.is_published).length;
    const homepage = pages.filter(p => p.is_homepage).length;
    const total = pages.length;

    console.log(`📈 Total des pages: ${total}`);
    console.log(`✅ Pages publiées: ${published}`);
    console.log(`🏠 Pages d'accueil: ${homepage}`);
    console.log(`⏸️ Pages en brouillon: ${total - published}`);

    console.log('\n📋 Liste complète:');
    pages.forEach(page => {
      const status = page.is_homepage ? '🏠' : (page.is_published ? '✅' : '⏸️');
      console.log(`  ${status} ${page.slug}: ${page.title}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage des statistiques:', error);
  }
}

// Gestion des arguments de ligne de commande
const command = process.argv[2];

switch (command) {
  case 'migrate':
    migrateStaticPages();
    break;
  case 'update':
    updateExistingPages();
    break;
  case 'stats':
    showStats();
    break;
  default:
    console.log('📖 Script de migration des pages statiques IAhome\n');
    console.log('Usage:');
    console.log('  node migrate-static-pages.js migrate  - Migrer les nouvelles pages');
    console.log('  node migrate-static-pages.js update   - Mettre à jour les pages existantes');
    console.log('  node migrate-static-pages.js stats    - Afficher les statistiques\n');
    console.log('Exemples:');
    console.log('  node migrate-static-pages.js migrate');
    console.log('  node migrate-static-pages.js stats');
} 