require('dotenv').config({ path: '.env.local' });

const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

async function testRealWebhook() {
  console.log('🧪 Test avec un vrai événement Stripe...');
  
  try {
    // 1. Récupérer les événements récents
    console.log('\n📋 Récupération des événements récents...');
    const events = await stripe.events.list({
      limit: 5,
      types: ['checkout.session.completed']
    });
    
    if (events.data.length === 0) {
      console.log('❌ Aucun événement checkout.session.completed trouvé');
      return;
    }
    
    console.log('✅ Événements trouvés:', events.data.length);
    
    // 2. Analyser le premier événement
    const event = events.data[0];
    console.log('\n📋 Analyse de l\'événement:', event.id);
    console.log('Type:', event.type);
    console.log('Créé:', new Date(event.created * 1000).toLocaleString());
    
    const session = event.data.object;
    console.log('Session ID:', session.id);
    console.log('Status:', session.status);
    console.log('Payment Status:', session.payment_status);
    console.log('Customer Email:', session.customer_email);
    console.log('Métadonnées:', session.metadata);
    
    // 3. Vérifier si les métadonnées sont correctes
    if (session.metadata?.customer_email && session.metadata?.items_ids) {
      console.log('\n✅ Métadonnées correctes trouvées');
      console.log('Email:', session.metadata.customer_email);
      console.log('IDs modules:', session.metadata.items_ids);
      
      // 4. Simuler ce que le webhook devrait faire
      console.log('\n🧪 Simulation du traitement webhook...');
      
      const customerEmail = session.customer_email;
      const itemsIds = session.metadata.items_ids.split(',');
      const amount = session.amount_total;
      
      console.log('📧 Envoi email à:', customerEmail);
      console.log('💰 Montant:', amount);
      console.log('📦 Modules:', itemsIds);
      
      // 5. Vérifier si l'accès a été créé
      console.log('\n🔍 Vérification de l\'accès dans la base de données...');
      
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      // Vérifier l'utilisateur
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', customerEmail)
        .single();
        
      if (profilesError || !profiles) {
        console.error('❌ Utilisateur non trouvé:', customerEmail);
        return;
      }
      
      console.log('✅ Utilisateur trouvé:', profiles.id);
      
      // Vérifier les accès pour chaque module
      for (const moduleId of itemsIds) {
        const { data: access, error: accessError } = await supabase
          .from('module_access')
          .select('id, created_at')
          .eq('user_id', profiles.id)
          .eq('module_id', parseInt(moduleId))
          .single();
          
        if (access) {
          console.log(`✅ Accès module ${moduleId} créé le:`, new Date(access.created_at).toLocaleString());
        } else {
          console.log(`❌ Accès module ${moduleId} manquant`);
        }
      }
      
      // 6. Vérifier les modules
      console.log('\n🔍 Vérification des modules...');
      for (const moduleId of itemsIds) {
        const { data: module, error: moduleError } = await supabase
          .from('modules')
          .select('id, title, price')
          .eq('id', moduleId)
          .single();
          
        if (module) {
          console.log(`✅ Module ${moduleId}: ${module.title} (${module.price})`);
        } else {
          console.log(`❌ Module ${moduleId} non trouvé`);
        }
      }
      
    } else {
      console.log('\n❌ Métadonnées manquantes ou incorrectes');
      console.log('Métadonnées:', session.metadata);
    }
    
    // 7. Recommandations
    console.log('\n📋 Recommandations:');
    console.log('1. Vérifier les logs du serveur Next.js lors du prochain paiement');
    console.log('2. S\'assurer que le webhook est bien configuré dans Stripe');
    console.log('3. Vérifier que les métadonnées sont correctement définies');
    console.log('4. Tester avec un nouveau paiement en mode test');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testRealWebhook().catch(console.error); 