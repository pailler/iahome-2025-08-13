// Script pour corriger le webhook Stripe
// Ce script montre les modifications à apporter au webhook

const webhookCorrections = `
// MODIFICATIONS À APPORTER DANS src/app/api/webhooks/stripe/route.ts

// 1. Dans la fonction handleCheckoutSessionCompleted, ajouter :

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🔍 Debug - Paiement réussi pour la session:', session.id);
  const customerEmail = session.customer_email || session.customer_details?.email;
  const amount = session.amount_total;
  const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
  
  if (customerEmail) {
    await sendPaymentConfirmationEmail(customerEmail, session, items, amount);
    
    // NOUVEAU : Créer les accès modules pour chaque item acheté
    for (const item of items) {
      await addModuleAccess(customerEmail, item.module_id, session.id);
    }
  } else {
    console.error('❌ Erreur - Email client manquant dans la session Stripe');
  }
}

// 2. Ajouter cette nouvelle fonction :

async function addModuleAccess(userEmail: string, moduleId: string, sessionId: string) {
  try {
    console.log('🔍 Debug - Ajout accès module pour:', userEmail, moduleId);
    
    // Récupérer l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();
    
    if (userError || !userData) {
      console.error('❌ Utilisateur non trouvé:', userEmail);
      return;
    }

    // Vérifier si l'accès existe déjà
    const { data: existingAccess, error: checkError } = await supabase
      .from('module_access')
      .select('id')
      .eq('user_id', userData.id)
      .eq('module_id', moduleId)
      .single();

    if (existingAccess) {
      console.log('✅ Accès déjà existant pour:', userEmail, moduleId);
      return;
    }

    // Créer l'accès module
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .insert({
        user_id: userData.id,
        module_id: moduleId,
        access_type: 'purchase',
        metadata: {
          session_id: sessionId,
          purchased_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (accessError) {
      console.error('❌ Erreur création accès module:', accessError);
    } else {
      console.log('✅ Accès module créé:', accessData.id);
    }
  } catch (error) {
    console.error('❌ Erreur ajout accès module:', error);
  }
}

// 3. Dans la fonction handlePaymentIntentSucceeded, ajouter aussi :

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('🔍 Debug - Paiement réussi pour l\'intention:', paymentIntent.id);
  
  const customerEmail = paymentIntent.metadata?.customer_email;
  const items = paymentIntent.metadata?.items ? JSON.parse(paymentIntent.metadata.items) : [];
  
  if (customerEmail) {
    await sendPaymentConfirmationEmail(customerEmail, null, items, paymentIntent.amount);
    
    // NOUVEAU : Créer les accès modules
    for (const item of items) {
      await addModuleAccess(customerEmail, item.module_id, paymentIntent.id);
    }
  } else {
    console.error('❌ Erreur - Email client manquant dans les métadonnées PaymentIntent');
  }
}
`;

console.log('🔧 Corrections à apporter au webhook Stripe :');
console.log(webhookCorrections);

console.log('\n📋 Résumé des modifications :');
console.log('1. Ajouter la fonction addModuleAccess()');
console.log('2. Modifier handleCheckoutSessionCompleted() pour appeler addModuleAccess()');
console.log('3. Modifier handlePaymentIntentSucceeded() pour appeler addModuleAccess()');
console.log('4. Vérifier que les métadonnées contiennent module_id'); 