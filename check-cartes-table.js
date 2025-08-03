const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCartesTable() {
  console.log('🔍 Vérification de la table cartes...\n');

  try {
    // 1. Vérifier si la table cartes existe
    console.log('📋 Test d\'accès à la table cartes...');
    const { data: cartes, error: cartesError } = await supabase
      .from('cartes')
      .select('*')
      .limit(1);

    if (cartesError) {
      console.log('❌ Table cartes non accessible:', cartesError.message);
    } else {
      console.log('✅ Table cartes accessible');
    }

    // 2. Compter les cartes
    console.log('\n📊 Comptage des cartes...');
    const { count: cartesCount, error: cartesCountError } = await supabase
      .from('cartes')
      .select('*', { count: 'exact', head: true });

    if (cartesCountError) {
      console.log('❌ Erreur comptage cartes:', cartesCountError.message);
    } else {
      console.log(`✅ Total des cartes dans la base : ${cartesCount}`);
    }

    // 3. Récupérer toutes les cartes
    console.log('\n📋 Récupération de toutes les cartes...');
    const { data: allCartes, error: allCartesError } = await supabase
      .from('cartes')
      .select('*')
      .order('title', { ascending: true });

    if (allCartesError) {
      console.log('❌ Erreur récupération cartes:', allCartesError.message);
    } else {
      console.log(`✅ ${allCartes?.length || 0} cartes récupérées :`);
      if (allCartes && allCartes.length > 0) {
        allCartes.forEach((carte, index) => {
          console.log(`   ${index + 1}. ${carte.title || carte.name} (${carte.category}, ${carte.price})`);
          if (carte.description) {
            console.log(`      Description: ${carte.description.substring(0, 100)}...`);
          }
        });
      }
    }

    // 4. Vérifier les autres tables possibles
    console.log('\n🔍 Vérification d\'autres tables possibles...');
    
    const possibleTables = ['applications', 'tools', 'services', 'products', 'items'];
    
    for (const tableName of possibleTables) {
      try {
        const { data: testData, error: testError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!testError) {
          console.log(`✅ Table ${tableName} existe`);
          
          const { count: tableCount } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          console.log(`   - Nombre d'éléments : ${tableCount}`);
        }
      } catch (error) {
        // Table n'existe pas, c'est normal
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }

  console.log('\n✨ Vérification terminée');
  console.log('\n💡 Si vous avez 12 modules mais que seulement 4 sont visibles :');
  console.log('   1. Vérifiez que tous les modules sont dans la table "modules"');
  console.log('   2. Vérifiez les permissions RLS sur la table');
  console.log('   3. Vérifiez le statut de publication des modules');
  console.log('   4. Vérifiez que vous êtes dans le bon environnement Supabase');
}

// Exécuter la vérification
checkCartesTable().catch(console.error); 