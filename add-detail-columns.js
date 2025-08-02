const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addDetailColumns() {
  console.log('🔧 Ajout des colonnes detail_* à la table cartes');
  console.log('================================================');
  console.log('');

  try {
    // 1. Vérifier la structure actuelle
    console.log('1️⃣ Vérification de la structure actuelle...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('cartes')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Erreur lors de la vérification:', sampleError);
      return;
    }

    if (sampleData && sampleData.length > 0) {
      const currentColumns = Object.keys(sampleData[0]);
      console.log('📋 Colonnes actuelles:', currentColumns);
      console.log('');
    }

    // 2. Ajouter les colonnes detail_* via une requête SQL
    console.log('2️⃣ Ajout des colonnes detail_*...');
    
    // Note: Nous ne pouvons pas exécuter ALTER TABLE directement via l'API Supabase
    // Il faut utiliser l'éditeur SQL de Supabase ou créer une fonction RPC
    
    console.log('⚠️ ATTENTION: Les colonnes detail_* doivent être ajoutées manuellement');
    console.log('   Veuillez exécuter le script SQL suivant dans l\'éditeur SQL de Supabase:');
    console.log('');
    console.log('   ALTER TABLE cartes');
    console.log('   ADD COLUMN IF NOT EXISTS detail_title TEXT,');
    console.log('   ADD COLUMN IF NOT EXISTS detail_content TEXT,');
    console.log('   ADD COLUMN IF NOT EXISTS detail_meta_description TEXT,');
    console.log('   ADD COLUMN IF NOT EXISTS detail_slug TEXT,');
    console.log('   ADD COLUMN IF NOT EXISTS detail_is_published BOOLEAN DEFAULT false;');
    console.log('');

    // 3. Créer un fichier SQL pour faciliter l'exécution
    console.log('3️⃣ Création du fichier SQL...');
    const sqlContent = `-- Script pour ajouter les colonnes detail_* à la table cartes
-- Exécutez ce script dans l'éditeur SQL de Supabase

ALTER TABLE cartes 
ADD COLUMN IF NOT EXISTS detail_title TEXT,
ADD COLUMN IF NOT EXISTS detail_content TEXT,
ADD COLUMN IF NOT EXISTS detail_meta_description TEXT,
ADD COLUMN IF NOT EXISTS detail_slug TEXT,
ADD COLUMN IF NOT EXISTS detail_is_published BOOLEAN DEFAULT false;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cartes' 
AND column_name LIKE 'detail_%'
ORDER BY column_name;`;

    const fs = require('fs');
    fs.writeFileSync('add-detail-columns.sql', sqlContent);
    console.log('✅ Fichier add-detail-columns.sql créé');
    console.log('');

    // 4. Instructions pour l'utilisateur
    console.log('📋 Instructions:');
    console.log('   1. Allez sur https://supabase.com/dashboard/project/xemtoyzcihmncbrlsmhr/sql');
    console.log('   2. Copiez le contenu du fichier add-detail-columns.sql');
    console.log('   3. Collez-le dans l\'éditeur SQL et exécutez');
    console.log('   4. Vérifiez que les colonnes ont été ajoutées');
    console.log('   5. Relancez ce script pour vérifier: node check-cartes-structure.js');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
addDetailColumns(); 