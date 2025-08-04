const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('📝 Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDetailColumns() {
  try {
    console.log('🔧 Ajout des colonnes manquantes à la table modules...');
    
    // Ajouter la colonne a_propos
    console.log('📝 Ajout de la colonne a_propos...');
    const { error: aProposError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE modules ADD COLUMN IF NOT EXISTS a_propos TEXT;'
    });
    
    if (aProposError) {
      console.log('⚠️ Erreur lors de l\'ajout de a_propos:', aProposError.message);
    } else {
      console.log('✅ Colonne a_propos ajoutée avec succès');
    }

    // Ajouter les colonnes pour les pages détaillées
    const detailColumns = [
      { name: 'detail_title', type: 'TEXT' },
      { name: 'detail_content', type: 'TEXT' },
      { name: 'detail_meta_description', type: 'TEXT' },
      { name: 'detail_slug', type: 'TEXT' },
      { name: 'detail_is_published', type: 'BOOLEAN DEFAULT false' }
    ];

    for (const column of detailColumns) {
      console.log(`📝 Ajout de la colonne ${column.name}...`);
      const { error: columnError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE modules ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`
      });
      
      if (columnError) {
        console.log(`⚠️ Erreur lors de l'ajout de ${column.name}:`, columnError.message);
      } else {
        console.log(`✅ Colonne ${column.name} ajoutée avec succès`);
      }
    }

    // Vérifier que toutes les colonnes ont été ajoutées
    console.log('\n📊 Vérification des colonnes...');
    const { data: columns, error: selectError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'modules' 
        AND column_name IN ('a_propos', 'detail_title', 'detail_content', 'detail_meta_description', 'detail_slug', 'detail_is_published')
        ORDER BY column_name;
      `
    });

    if (selectError) {
      console.error('❌ Erreur lors de la vérification:', selectError.message);
    } else {
      console.log('✅ Colonnes vérifiées:');
      console.table(columns);
    }

    // Afficher quelques exemples de modules pour vérifier
    console.log('\n📋 Exemples de modules:');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title, a_propos, detail_title, detail_is_published')
      .limit(3);

    if (modulesError) {
      console.error('❌ Erreur lors de la récupération des modules:', modulesError.message);
    } else {
      console.log('✅ Modules récupérés:');
      console.table(modules);
    }

    console.log('\n🎉 Opération terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addDetailColumns(); 