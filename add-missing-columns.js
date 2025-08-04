const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration Supabase (à remplacer par vos vraies valeurs)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'VOTRE_URL_SUPABASE';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'VOTRE_CLE_SERVICE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingColumns() {
  try {
    console.log('🔧 Ajout des colonnes manquantes à la table modules...');
    
    // Vérifier la structure actuelle
    console.log('📊 Structure actuelle de la table modules:');
    const { data: currentColumns, error: currentError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'modules' 
          ORDER BY column_name;
        `
      });
    
    if (currentError) {
      console.error('❌ Erreur lors de la vérification de la structure:', currentError);
      return;
    }
    
    console.log('Colonnes actuelles:', currentColumns);
    
    // Ajouter les colonnes manquantes
    const columnsToAdd = [
      'youtube_url TEXT',
      'a_propos TEXT', 
      'detail_title TEXT',
      'detail_content TEXT',
      'detail_meta_description TEXT',
      'detail_slug TEXT',
      'detail_is_published BOOLEAN DEFAULT false'
    ];
    
    for (const columnDef of columnsToAdd) {
      const columnName = columnDef.split(' ')[0];
      console.log(`➕ Ajout de la colonne: ${columnName}`);
      
      const { error } = await supabase
        .rpc('exec_sql', {
          sql: `ALTER TABLE modules ADD COLUMN IF NOT EXISTS ${columnDef};`
        });
      
      if (error) {
        console.error(`❌ Erreur lors de l'ajout de ${columnName}:`, error);
      } else {
        console.log(`✅ Colonne ${columnName} ajoutée avec succès`);
      }
    }
    
    // Vérifier la structure finale
    console.log('📊 Structure finale de la table modules:');
    const { data: finalColumns, error: finalError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'modules' 
          ORDER BY column_name;
        `
      });
    
    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
      return;
    }
    
    console.log('Colonnes finales:', finalColumns);
    
    // Afficher quelques exemples de données
    const { data: sampleData, error: sampleError } = await supabase
      .from('modules')
      .select('id, title, youtube_url, a_propos, detail_title, detail_is_published')
      .limit(5);
    
    if (sampleError) {
      console.error('❌ Erreur lors de la récupération des données:', sampleError);
      return;
    }
    
    console.log('📋 Exemples de données:', sampleData);
    console.log('✅ Toutes les colonnes ont été ajoutées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

addMissingColumns(); 