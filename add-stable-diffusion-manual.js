// Charger les variables d'environnement
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addStableDiffusionManual() {
  console.log('🔧 Ajout manuel de Stable Diffusion à formateur_tic@hotmail.com');
  
  const userEmail = 'formateur_tic@hotmail.com';
  const moduleId = 15; // ID de Stable Diffusion
  const userId = 'ebaace8e-caa6-4a77-b87c-fe66852cb9cc'; // ID utilisateur connu
  
  try {
    // 1. Vérifier que le module existe
    console.log('\n1️⃣ Vérification du module Stable Diffusion...');
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();
    
    if (moduleError || !moduleData) {
      console.error('❌ Module non trouvé:', moduleId);
      return;
    }
    
    console.log('✅ Module trouvé:', moduleData.title);
    
    // 2. Essayer d'ajouter l'accès directement
    console.log('\n2️⃣ Ajout de l\'accès...');
    const accessData = {
      user_id: userId,
      module_id: moduleId,
      access_type: 'purchase',
      metadata: {
        manual_add: true,
        added_at: new Date().toISOString()
      }
    };
    
    console.log('Données à insérer:', accessData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('module_access')
      .insert(accessData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erreur insertion:', insertError);
      
      // Si l'erreur est liée au type UUID, on doit modifier la table
      if (insertError.message.includes('uuid')) {
        console.log('\n🔧 La table module_access nécessite une modification...');
        console.log('Exécutez ce script SQL dans Supabase :');
        console.log(`
-- Recréer la table module_access avec le bon type
DROP TABLE IF EXISTS module_access;

CREATE TABLE module_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    module_id INTEGER NOT NULL,
    access_type TEXT NOT NULL DEFAULT 'purchase',
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer des index
CREATE INDEX idx_module_access_user_id ON module_access(user_id);
CREATE INDEX idx_module_access_module_id ON module_access(module_id);
CREATE INDEX idx_module_access_user_module ON module_access(user_id, module_id);
        `);
      }
      return;
    }
    
    console.log('✅ Accès créé:', insertData.id);
    
    // 3. Vérifier que l'accès apparaît
    console.log('\n3️⃣ Vérification de l\'accès...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('module_access')
      .select('*')
      .eq('user_id', userId);
    
    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError);
    } else {
      console.log('📊 Accès trouvés:', verifyData?.length || 0);
      verifyData?.forEach(access => {
        console.log(`  - Module ID: ${access.module_id}, Type: ${access.access_type}`);
      });
    }
    
    console.log('\n🎉 Ajout terminé !');
    console.log('L\'utilisateur formateur_tic@hotmail.com a maintenant accès à Stable Diffusion');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter l'ajout
addStableDiffusionManual(); 