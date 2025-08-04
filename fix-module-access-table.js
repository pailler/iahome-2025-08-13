// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixModuleAccessTable() {
  console.log('🔧 Correction de la table module_access');
  
  try {
    // 1. Vérifier la structure actuelle
    console.log('\n1️⃣ Vérification de la structure actuelle...');
    const { data: structureData, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'module_access' });
    
    if (structureError) {
      console.log('Utilisation d\'une approche alternative...');
      
      // Vérifier si la table existe et a des données
      const { data: accessData, error: accessError } = await supabase
        .from('module_access')
        .select('*')
        .limit(1);
      
      if (accessError) {
        console.error('❌ Erreur accès à module_access:', accessError);
        return;
      }
      
      console.log('✅ Table module_access accessible');
      console.log('📊 Données existantes:', accessData?.length || 0);
      
      if (accessData && accessData.length > 0) {
        console.log('Exemple de données:', accessData[0]);
      }
    }
    
    // 2. Essayer d'ajouter un accès de test avec un ID numérique
    console.log('\n2️⃣ Test d\'ajout d\'accès avec ID numérique...');
    const testAccess = {
      user_id: 'ebaace8e-caa6-4a77-b87c-fe66852cb9cc', // ID utilisateur test
      module_id: 15, // ID numérique de Stable Diffusion
      access_type: 'test',
      metadata: {
        test: true,
        created_at: new Date().toISOString()
      }
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('module_access')
      .insert(testAccess)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erreur insertion test:', insertError);
      console.log('La table module_access nécessite probablement une modification...');
    } else {
      console.log('✅ Test d\'insertion réussi:', insertData.id);
      
      // Supprimer l'accès de test
      const { error: deleteError } = await supabase
        .from('module_access')
        .delete()
        .eq('id', insertData.id);
      
      if (deleteError) {
        console.error('❌ Erreur suppression test:', deleteError);
      } else {
        console.log('✅ Accès de test supprimé');
      }
    }
    
    console.log('\n🎉 Vérification terminée !');
    console.log('Si l\'insertion a échoué, la table module_access doit être modifiée pour accepter des entiers.');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la correction
fixModuleAccessTable(); 