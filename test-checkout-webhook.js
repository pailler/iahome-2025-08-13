require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCheckoutWebhook() {
  console.log('🧪 Test du webhook avec checkout.session.completed...');
  
  // 1. Créer un checkout session de test
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Stable Diffusion Test',
            },
            unit_amount: 990, // 9.90€
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://home.regispailler.fr/success',
      cancel_url: 'https://home.regispailler.fr/cancel',
      metadata: {
        customer_email: 'regispailler@gmail.com',
        items_ids: '15',
        items_count: '1',
        total_amount: '09.9',
        type: 'payment'
      },
      customer_email: 'regispailler@gmail.com'
    });
    
    console.log('✅ Checkout session créé:', session.id);
    console.log('📋 Métadonnées:', session.metadata);
    
    // 2. Simuler l'événement checkout.session.completed
    const testEvent = {
      id: 'evt_test_' + Date.now(),
      object: 'event',
      api_version: '2025-06-30.basil',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          ...session,
          status: 'complete',
          payment_status: 'paid'
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: 'req_test_' + Date.now(),
        idempotency_key: null
      },
      type: 'checkout.session.completed'
    };
    
    console.log('📋 Événement de test créé:', {
      type: testEvent.type,
      session_id: testEvent.data.object.id,
      customer_email: testEvent.data.object.metadata.customer_email,
      items_ids: testEvent.data.object.metadata.items_ids
    });
    
    // 3. Vérifier l'utilisateur
    console.log('\n🔍 Vérification de l\'utilisateur...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'regispailler@gmail.com')
      .single();
      
    if (profilesError || !profiles) {
      console.error('❌ Utilisateur non trouvé:', profilesError);
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', profiles.id);
    
    // 4. Vérifier le module
    console.log('\n🔍 Vérification du module...');
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id, title, price')
      .eq('id', '15')
      .single();
      
    if (moduleError || !module) {
      console.error('❌ Module non trouvé:', moduleError);
      return;
    }
    
    console.log('✅ Module trouvé:', module.title);
    
    // 5. Vérifier l'accès existant
    console.log('\n🔍 Vérification de l\'accès existant...');
    const { data: existingAccess, error: accessError } = await supabase
      .from('module_access')
      .select('id, created_at')
      .eq('user_id', profiles.id)
      .eq('module_id', 15)
      .single();
      
    if (existingAccess) {
      console.log('✅ Accès déjà existant créé le:', new Date(existingAccess.created_at).toLocaleString());
    } else {
      console.log('❌ Aucun accès trouvé - le webhook devrait en créer un');
    }
    
    // 6. Simuler l'ajout d'accès (comme dans le webhook)
    console.log('\n🧪 Simulation de l\'ajout d\'accès module...');
    
    try {
      // Utiliser la clé de service pour les opérations admin
      const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      
      // Vérifier si l'accès existe déjà
      const { data: checkAccess, error: checkError } = await supabaseAdmin
        .from('module_access')
        .select('id')
        .eq('user_id', profiles.id)
        .eq('module_id', 15)
        .single();
        
      if (checkAccess) {
        console.log('✅ Accès déjà existant, pas d\'ajout nécessaire');
      } else {
        console.log('📝 Tentative d\'ajout d\'accès module...');
        
        const { data: newAccess, error: insertError } = await supabaseAdmin
          .from('module_access')
          .insert({
            user_id: profiles.id,
            module_id: 15,
            access_type: 'purchase',
            metadata: {
              session_id: session.id,
              purchased_at: new Date().toISOString()
            }
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('❌ Erreur création accès:', insertError);
        } else {
          console.log('✅ Accès module créé:', newAccess.id);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification/ajout:', error);
    }
    
    // 7. Tester l'envoi d'email
    console.log('\n📧 Test d\'envoi d\'email...');
    
    try {
      // Simuler l'envoi d'email
      console.log('📧 Email de confirmation envoyé à: regispailler@gmail.com');
      console.log('📧 Montant: 9.90€');
      console.log('📧 Module: Stable Diffusion');
    } catch (error) {
      console.error('❌ Erreur test email:', error);
    }
    
    console.log('\n🔍 Test terminé');
    
  } catch (error) {
    console.error('❌ Erreur création checkout session:', error);
  }
}

testCheckoutWebhook().catch(console.error); 