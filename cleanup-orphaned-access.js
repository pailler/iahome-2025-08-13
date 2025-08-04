// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupOrphanedAccess() {
  console.log('🧹 Nettoyage des accès modules orphelins');
  
  try {
    // 1. Récupérer tous les accès modules
    console.log('\n1️⃣ Récupération de tous les accès modules...');
    const { data: allAccess, error: accessError } = await supabase
      .from('module_access')
      .select('*');
    
    if (accessError) {
      console.error('❌ Erreur récupération accès:', accessError);
      return;
    }
    
    console.log('📊 Accès modules trouvés:', allAccess?.length || 0);
    
    // 2. Récupérer tous les modules existants
    console.log('\n2️⃣ Récupération de tous les modules...');
    const { data: allModules, error: modulesError } = await supabase
      .from('modules')
      .select('id');
    
    if (modulesError) {
      console.error('❌ Erreur récupération modules:', modulesError);
      return;
    }
    
    const existingModuleIds = new Set(allModules?.map(m => m.id) || []);
    console.log('📊 Modules existants:', existingModuleIds.size);
    
    // 3. Identifier les accès orphelins
    console.log('\n3️⃣ Identification des accès orphelins...');
    const orphanedAccess = allAccess?.filter(access => !existingModuleIds.has(access.module_id)) || [];
    
    console.log('📊 Accès orphelins trouvés:', orphanedAccess.length);
    
    if (orphanedAccess.length > 0) {
      orphanedAccess.forEach((access, index) => {
        console.log(`  ${index + 1}. User: ${access.user_id}, Module: ${access.module_id}, Type: ${access.access_type}`);
      });
      
      // 4. Demander confirmation pour la suppression
      console.log('\n4️⃣ Suppression des accès orphelins...');
      
      // Supprimer les accès orphelins
      const orphanedIds = orphanedAccess.map(access => access.id);
      const { data: deleteResult, error: deleteError } = await supabase
        .from('module_access')
        .delete()
        .in('id', orphanedIds);
      
      if (deleteError) {
        console.error('❌ Erreur suppression accès orphelins:', deleteError);
      } else {
        console.log('✅ Accès orphelins supprimés:', orphanedAccess.length);
      }
    } else {
      console.log('✅ Aucun accès orphelin trouvé');
    }
    
    // 5. Vérification finale
    console.log('\n5️⃣ Vérification finale...');
    const { data: finalAccess, error: finalError } = await supabase
      .from('module_access')
      .select('*');
    
    if (finalError) {
      console.error('❌ Erreur vérification finale:', finalError);
    } else {
      console.log('📊 Accès modules restants:', finalAccess?.length || 0);
    }
    
    console.log('\n🎉 Nettoyage terminé !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le nettoyage
cleanupOrphanedAccess(); 