require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function monitorModules() {
  console.log('🔍 Surveillance des modules en temps réel');
  console.log('Appuyez sur Ctrl+C pour arrêter\n');
  
  let lastCount = 0;
  
  while (true) {
    try {
      // Récupérer l'utilisateur
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', 'formateur_tic@hotmail.com')
        .single();
      
      if (userError) {
        console.error('❌ Erreur récupération utilisateur:', userError);
        continue;
      }
      
      // Récupérer les accès modules
      const { data: access, error: accessError } = await supabase
        .from('module_access')
        .select(`
          id,
          created_at,
          metadata,
          cartes!inner(title, price)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (accessError) {
        console.error('❌ Erreur récupération accès:', accessError);
        continue;
      }
      
      const currentCount = access.length;
      const now = new Date().toLocaleTimeString();
      
      // Afficher seulement si il y a un changement
      if (currentCount !== lastCount) {
        console.log(`\n🕐 ${now} - Modules: ${currentCount}`);
        
        if (currentCount > 0) {
          access.forEach((acc, index) => {
            const isNew = index < (currentCount - lastCount);
            const status = isNew ? '🆕 NOUVEAU' : '✅';
            console.log(`   ${status} ${acc.cartes.title} (€${acc.cartes.price})`);
            if (isNew) {
              console.log(`      ID: ${acc.id}`);
              console.log(`      Acheté: ${new Date(acc.created_at).toLocaleString()}`);
            }
          });
        } else {
          console.log('   Aucun module');
        }
        
        lastCount = currentCount;
      }
      
      // Attendre 2 secondes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('❌ Erreur surveillance:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

monitorModules(); 