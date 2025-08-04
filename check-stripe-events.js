require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkStripeEvents() {
  try {
    console.log('🔍 Vérification des événements Stripe récents...');
    
    // Récupérer les événements récents
    const events = await stripe.events.list({
      limit: 20,
      types: ['checkout.session.completed', 'payment_intent.succeeded']
    });
    
    console.log(`📋 ${events.data.length} événements récents trouvés:`);
    
    for (const event of events.data) {
      console.log(`\n🔍 Événement ${event.type} (${event.created}):`);
      console.log(`  ID: ${event.id}`);
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`  Email: ${session.customer_email || session.customer_details?.email}`);
        console.log(`  Montant: ${session.amount_total}`);
        console.log(`  Métadonnées:`, session.metadata);
        
        // Vérifier si c'est pour regispailler@gmail.com
        const customerEmail = session.customer_email || session.customer_details?.email;
        if (customerEmail === 'regispailler@gmail.com') {
          console.log('  ✅ Événement pour regispailler@gmail.com trouvé!');
          console.log('  📋 Détails complets:', JSON.stringify(session, null, 2));
        }
      }
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log(`  Email: ${paymentIntent.metadata?.customer_email}`);
        console.log(`  Montant: ${paymentIntent.amount}`);
        console.log(`  Métadonnées:`, paymentIntent.metadata);
        
        // Vérifier si c'est pour regispailler@gmail.com
        if (paymentIntent.metadata?.customer_email === 'regispailler@gmail.com') {
          console.log('  ✅ Événement pour regispailler@gmail.com trouvé!');
          console.log('  📋 Détails complets:', JSON.stringify(paymentIntent, null, 2));
        }
      }
    }
    
    // Chercher spécifiquement les sessions de checkout pour regispailler@gmail.com
    console.log('\n🔍 Recherche spécifique des sessions checkout pour regispailler@gmail.com...');
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
      customer_email: 'regispailler@gmail.com'
    });
    
    if (sessions.data.length > 0) {
      console.log(`📋 ${sessions.data.length} sessions checkout trouvées:`);
      sessions.data.forEach(session => {
        console.log(`\n  Session ${session.id}:`);
        console.log(`    Status: ${session.status}`);
        console.log(`    Montant: ${session.amount_total}`);
        console.log(`    Métadonnées:`, session.metadata);
        console.log(`    Créée: ${new Date(session.created * 1000).toISOString()}`);
      });
    } else {
      console.log('  Aucune session checkout trouvée pour regispailler@gmail.com');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des événements Stripe:', error);
  }
}

checkStripeEvents(); 