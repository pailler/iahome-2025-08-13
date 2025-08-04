// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupModuleMapping() {
  console.log('🔧 Configuration de la table de correspondance module_id_mapping');
  
  try {
    // 1. Créer la table de correspondance
    console.log('\n1️⃣ Création de la table module_id_mapping...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS module_id_mapping (
          id SERIAL PRIMARY KEY,
          numeric_id INTEGER NOT NULL UNIQUE,
          uuid_id UUID NOT NULL UNIQUE,
          module_title TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.log('Table peut déjà exister, continuation...');
    } else {
      console.log('✅ Table module_id_mapping créée');
    }
    
    // 2. Insérer les correspondances
    console.log('\n2️⃣ Insertion des correspondances...');
    const modules = [
      { numeric_id: 3, title: 'Metube' },
      { numeric_id: 4, title: 'Bannière HA' },
      { numeric_id: 5, title: 'AI Assistant' },
      { numeric_id: 6, title: 'Cogstudio' },
      { numeric_id: 8, title: 'Invoke' },
      { numeric_id: 9, title: 'Librespeed' },
      { numeric_id: 10, title: 'PDF+' },
      { numeric_id: 11, title: 'PSitransfer' },
      { numeric_id: 12, title: 'QR codes dynamiques' },
      { numeric_id: 13, title: 'ruinedfooocus' },
      { numeric_id: 15, title: 'Stable diffusion' },
      { numeric_id: 17, title: 'Video Editor' },
      { numeric_id: 19, title: 'Module Gratuit Test' }
    ];
    
    for (const module of modules) {
      const { error: insertError } = await supabase
        .from('module_id_mapping')
        .upsert({
          numeric_id: module.numeric_id,
          uuid_id: crypto.randomUUID(),
          module_title: module.title
        }, {
          onConflict: 'numeric_id'
        });
      
      if (insertError) {
        console.error(`❌ Erreur insertion ${module.title}:`, insertError);
      } else {
        console.log(`✅ ${module.title} ajouté`);
      }
    }
    
    // 3. Vérifier les données
    console.log('\n3️⃣ Vérification des données...');
    const { data: mappingData, error: mappingError } = await supabase
      .from('module_id_mapping')
      .select('*')
      .order('numeric_id');
    
    if (mappingError) {
      console.error('❌ Erreur récupération mapping:', mappingError);
    } else {
      console.log('📊 Correspondances créées:', mappingData?.length || 0);
      mappingData?.forEach(mapping => {
        console.log(`  ${mapping.numeric_id} -> ${mapping.uuid_id} (${mapping.module_title})`);
      });
    }
    
    // 4. Test avec Stable Diffusion
    console.log('\n4️⃣ Test avec Stable Diffusion...');
    const { data: stableMapping, error: stableError } = await supabase
      .from('module_id_mapping')
      .select('*')
      .eq('module_title', 'Stable diffusion')
      .single();
    
    if (stableError) {
      console.error('❌ Erreur récupération Stable Diffusion:', stableError);
    } else {
      console.log('✅ Mapping Stable Diffusion:', {
        numeric_id: stableMapping.numeric_id,
        uuid_id: stableMapping.uuid_id,
        title: stableMapping.module_title
      });
    }
    
    console.log('\n🎉 Configuration terminée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la configuration
setupModuleMapping(); 