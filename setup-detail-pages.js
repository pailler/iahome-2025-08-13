const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Présent' : 'Manquant');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Présent' : 'Manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDetailPages() {
  console.log('🚀 Configuration de la table detail_pages...');

  try {
    // 1. Créer la table detail_pages
    console.log('📋 Création de la table detail_pages...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS detail_pages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          card_id UUID REFERENCES cartes(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          meta_description TEXT,
          slug TEXT UNIQUE NOT NULL,
          is_published BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error('❌ Erreur lors de la création de la table:', createError);
      return;
    }

    console.log('✅ Table detail_pages créée avec succès');

    // 2. Créer les index
    console.log('🔍 Création des index...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_detail_pages_card_id ON detail_pages(card_id);',
      'CREATE INDEX IF NOT EXISTS idx_detail_pages_slug ON detail_pages(slug);',
      'CREATE INDEX IF NOT EXISTS idx_detail_pages_published ON detail_pages(is_published);'
    ];

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (indexError) {
        console.error('❌ Erreur lors de la création de l\'index:', indexError);
      }
    }

    console.log('✅ Index créés avec succès');

    // 3. Activer RLS
    console.log('🔒 Activation de RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE detail_pages ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('❌ Erreur lors de l\'activation de RLS:', rlsError);
    } else {
      console.log('✅ RLS activé');
    }

    // 4. Créer les politiques RLS
    console.log('📜 Création des politiques RLS...');
    const policies = [
      `CREATE POLICY "Pages détaillées publiques visibles par tous" ON detail_pages
       FOR SELECT USING (is_published = true);`,
      `CREATE POLICY "Admins peuvent tout faire sur les pages détaillées" ON detail_pages
       FOR ALL USING (
         EXISTS (
           SELECT 1 FROM profiles 
           WHERE profiles.id = auth.uid() 
           AND profiles.role = 'admin'
         )
       );`
    ];

    for (const policySql of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policySql });
      if (policyError && !policyError.message.includes('already exists')) {
        console.error('❌ Erreur lors de la création de la politique:', policyError);
      }
    }

    console.log('✅ Politiques RLS créées');

    // 5. Créer le trigger pour updated_at
    console.log('⚡ Création du trigger updated_at...');
    const triggerSql = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_detail_pages_updated_at ON detail_pages;
      CREATE TRIGGER update_detail_pages_updated_at 
          BEFORE UPDATE ON detail_pages 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSql });
    if (triggerError) {
      console.error('❌ Erreur lors de la création du trigger:', triggerError);
    } else {
      console.log('✅ Trigger créé');
    }

    // 6. Insérer des données d'exemple
    console.log('📝 Insertion de données d\'exemple...');
    
    // Récupérer les cartes existantes
    const { data: cards, error: cardsError } = await supabase
      .from('cartes')
      .select('id, title')
      .limit(5);

    if (cardsError) {
      console.error('❌ Erreur lors de la récupération des cartes:', cardsError);
      return;
    }

    console.log(`📊 ${cards.length} cartes trouvées`);

    // Vérifier s'il y a déjà des pages détaillées
    const { data: existingPages, error: pagesError } = await supabase
      .from('detail_pages')
      .select('card_id');

    if (pagesError) {
      console.error('❌ Erreur lors de la vérification des pages existantes:', pagesError);
      return;
    }

    const existingCardIds = existingPages.map(p => p.card_id);
    const cardsToProcess = cards.filter(card => !existingCardIds.includes(card.id));

    console.log(`📝 Création de pages détaillées pour ${cardsToProcess.length} cartes`);

    for (const card of cardsToProcess) {
      const pageData = {
        card_id: card.id,
        title: `Guide complet ${card.title}`,
        content: `Ceci est un guide détaillé pour ${card.title}. Cette page contient des informations approfondies, des tutoriels, des exemples pratiques et des conseils d'utilisation. Vous y trouverez tout ce dont vous avez besoin pour maîtriser cet outil IA.`,
        meta_description: `Guide complet et détaillé pour ${card.title} - Tutoriels, exemples et conseils pratiques`,
        slug: `guide-${card.title.toLowerCase().replace(/\s+/g, '-')}`,
        is_published: true
      };

      const { error: insertError } = await supabase
        .from('detail_pages')
        .insert([pageData]);

      if (insertError) {
        console.error(`❌ Erreur lors de l'insertion pour ${card.title}:`, insertError);
      } else {
        console.log(`✅ Page créée pour ${card.title}`);
      }
    }

    // 7. Vérifier le résultat final
    console.log('🔍 Vérification finale...');
    const { data: finalPages, error: finalError } = await supabase
      .from('detail_pages')
      .select(`
        *,
        card:cartes(title)
      `);

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log(`✅ Configuration terminée ! ${finalPages.length} pages détaillées créées`);
      console.log('📋 Pages créées:');
      finalPages.forEach(page => {
        console.log(`  - ${page.title} (liée à: ${page.card?.title})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Fonction alternative si exec_sql n'existe pas
async function setupDetailPagesAlternative() {
  console.log('🚀 Configuration alternative de la table detail_pages...');

  try {
    // Vérifier si la table existe
    const { data: tableExists, error: checkError } = await supabase
      .from('detail_pages')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('❌ La table detail_pages n\'existe pas. Veuillez l\'exécuter manuellement dans Supabase SQL Editor:');
      console.log('📋 Contenu du fichier create-detail-pages-table.sql');
      return;
    }

    console.log('✅ La table detail_pages existe déjà');

    // Insérer des données d'exemple
    console.log('📝 Insertion de données d\'exemple...');
    
    const { data: cards, error: cardsError } = await supabase
      .from('cartes')
      .select('id, title')
      .limit(5);

    if (cardsError) {
      console.error('❌ Erreur lors de la récupération des cartes:', cardsError);
      return;
    }

    console.log(`📊 ${cards.length} cartes trouvées`);

    // Vérifier s'il y a déjà des pages détaillées
    const { data: existingPages, error: pagesError } = await supabase
      .from('detail_pages')
      .select('card_id');

    if (pagesError) {
      console.error('❌ Erreur lors de la vérification des pages existantes:', pagesError);
      return;
    }

    const existingCardIds = existingPages.map(p => p.card_id);
    const cardsToProcess = cards.filter(card => !existingCardIds.includes(card.id));

    console.log(`📝 Création de pages détaillées pour ${cardsToProcess.length} cartes`);

    for (const card of cardsToProcess) {
      const pageData = {
        card_id: card.id,
        title: `Guide complet ${card.title}`,
        content: `Ceci est un guide détaillé pour ${card.title}. Cette page contient des informations approfondies, des tutoriels, des exemples pratiques et des conseils d'utilisation. Vous y trouverez tout ce dont vous avez besoin pour maîtriser cet outil IA.`,
        meta_description: `Guide complet et détaillé pour ${card.title} - Tutoriels, exemples et conseils pratiques`,
        slug: `guide-${card.title.toLowerCase().replace(/\s+/g, '-')}`,
        is_published: true
      };

      const { error: insertError } = await supabase
        .from('detail_pages')
        .insert([pageData]);

      if (insertError) {
        console.error(`❌ Erreur lors de l'insertion pour ${card.title}:`, insertError);
      } else {
        console.log(`✅ Page créée pour ${card.title}`);
      }
    }

    // Vérifier le résultat final
    const { data: finalPages, error: finalError } = await supabase
      .from('detail_pages')
      .select(`
        *,
        card:cartes(title)
      `);

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log(`✅ Configuration terminée ! ${finalPages.length} pages détaillées créées`);
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
async function main() {
  console.log('🎯 Script de configuration des pages détaillées');
  console.log('==============================================');
  
  try {
    await setupDetailPages();
  } catch (error) {
    console.log('🔄 Tentative avec la méthode alternative...');
    await setupDetailPagesAlternative();
  }
}

main(); 