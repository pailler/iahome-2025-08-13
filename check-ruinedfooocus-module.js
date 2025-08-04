require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Présent' : '❌ Manquant');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Présent' : '❌ Manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRuinedfooocusModule() {
  try {
    console.log('🔍 Vérification du module ruinedfooocus...');
    
    // Chercher par titre exact
    const { data: exactMatch, error: exactError } = await supabase
      .from('modules')
      .select('*')
      .eq('title', 'ruinedfooocus')
      .single();
    
    if (exactMatch) {
      console.log('✅ Module trouvé par titre exact:', exactMatch);
      return exactMatch;
    }
    
    // Chercher par titre contenant "ruined"
    const { data: partialMatches, error: partialError } = await supabase
      .from('modules')
      .select('*')
      .ilike('title', '%ruined%');
    
    if (partialMatches && partialMatches.length > 0) {
      console.log('🔍 Modules trouvés avec "ruined":', partialMatches);
    }
    
    // Chercher par titre contenant "fooocus"
    const { data: fooocusMatches, error: fooocusError } = await supabase
      .from('modules')
      .select('*')
      .ilike('title', '%fooocus%');
    
    if (fooocusMatches && fooocusMatches.length > 0) {
      console.log('🔍 Modules trouvés avec "fooocus":', fooocusMatches);
    }
    
    // Lister tous les modules pour voir ce qui existe
    const { data: allModules, error: allError } = await supabase
      .from('modules')
      .select('id, title, price')
      .order('title');
    
    if (allModules) {
      console.log('📋 Tous les modules disponibles:');
      allModules.forEach(module => {
        console.log(`  - ${module.id}: ${module.title} (€${module.price})`);
      });
    }
    
    console.log('❌ Module "ruinedfooocus" non trouvé');
    return null;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return null;
  }
}

checkRuinedfooocusModule(); 