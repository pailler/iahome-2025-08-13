import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { emailService } from '../../../../utils/emailService';
import { supabase } from '../../../../utils/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Signature Stripe manquante');
      return NextResponse.json(
        { error: 'Signature manquante' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Erreur de signature webhook:', err);
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 400 }
      );
    }

    console.log('Webhook reçu:', event.type);

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🔍 Debug - Paiement réussi pour la session:', session.id);
  const customerEmail = session.customer_email || session.customer_details?.email;
  const amount = session.amount_total;
  
  // Récupérer les IDs des modules depuis les métadonnées
  const itemsIds = session.metadata?.items_ids ? session.metadata.items_ids.split(',') : [];
  console.log('🔍 Debug - IDs des modules:', itemsIds);
  
  if (customerEmail && itemsIds.length > 0) {
    // Créer un objet items pour l'email
    const items = itemsIds.map((id: string) => ({ id, module_id: id }));
    await sendPaymentConfirmationEmail(customerEmail, session, items, amount);
    
    // Créer les accès modules pour chaque item acheté
    for (const moduleId of itemsIds) {
      await addModuleAccess(customerEmail, moduleId, session.id);
    }
  } else {
    console.error('❌ Erreur - Email client ou IDs modules manquants dans la session Stripe');
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('🔍 Debug - Paiement réussi pour l\'intention:', paymentIntent.id);
  console.log('🔍 Debug - PaymentIntent complète:', JSON.stringify(paymentIntent, null, 2));
  
  // Récupérer les détails du client depuis les métadonnées
  const customerEmail = paymentIntent.metadata?.customer_email;
  const itemsIds = paymentIntent.metadata?.items_ids ? paymentIntent.metadata.items_ids.split(',') : [];
  
  console.log('🔍 Debug - Email récupéré:', customerEmail);
  console.log('🔍 Debug - IDs des modules:', itemsIds);
  console.log('🔍 Debug - Montant:', paymentIntent.amount);
  
  if (customerEmail && itemsIds.length > 0) {
    console.log('🔍 Debug - Envoi email de confirmation à:', customerEmail);
    // Créer un objet items pour l'email
    const items = itemsIds.map((id: string) => ({ id, module_id: id }));
    await sendPaymentConfirmationEmail(customerEmail, null, items, paymentIntent.amount);
    
    // Créer les accès modules pour chaque item acheté
    for (const moduleId of itemsIds) {
      await addModuleAccess(customerEmail, moduleId, paymentIntent.id);
    }
  } else {
    console.error('❌ Erreur - Email client ou IDs modules manquants dans les métadonnées PaymentIntent');
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('🔍 Debug - Paiement d\'abonnement réussi pour l\'invoice:', invoice.id);
  console.log('🔍 Debug - Invoice complète:', JSON.stringify(invoice, null, 2));
  
  const customerEmail = invoice.customer_email;
  console.log('🔍 Debug - Email récupéré:', customerEmail);
  
  if (customerEmail) {
    console.log('🔍 Debug - Envoi email de confirmation d\'abonnement à:', customerEmail);
    await sendSubscriptionConfirmationEmail(customerEmail, invoice);
  } else {
    console.error('❌ Erreur - Email client manquant dans l\'invoice');
  }
}

async function sendPaymentConfirmationEmail(
  email: string, 
  session: Stripe.Checkout.Session | null, 
  items: any[], 
  amount: number | null
) {
  try {
    console.log('🔍 Debug - Envoi d\'email de confirmation à:', email);
    console.log('🔍 Debug - Détails:', { email, amount, itemsCount: items.length, sessionId: session?.id });
    
    if (amount) {
      const success = await emailService.sendPaymentConfirmation(
        email,
        amount,
        items,
        session?.id
      );
      console.log('🔍 Debug - Résultat envoi email:', success);
      return success;
    } else {
      console.error('❌ Erreur - Montant manquant pour l\'envoi d\'email');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
}

async function sendSubscriptionConfirmationEmail(email: string, invoice: Stripe.Invoice) {
  try {
    console.log('🔍 Debug - Envoi d\'email de confirmation d\'abonnement à:', email);
    console.log('🔍 Debug - Détails invoice:', { 
      email, 
      amount: invoice.amount_paid,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end
    });
    
    const success = await emailService.sendSubscriptionConfirmation(
      email,
      {
        amount: invoice.amount_paid,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
        planName: invoice.lines?.data[0]?.description || 'Plan Premium'
      }
    );
    
    console.log('🔍 Debug - Résultat envoi email abonnement:', success);
    return success;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email d\'abonnement:', error);
    return false;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Paiement échoué pour l\'intention:', paymentIntent.id);
  
  const customerEmail = paymentIntent.metadata?.customer_email;
  const errorMessage = paymentIntent.last_payment_error?.message || 'Erreur de paiement inconnue';
  
  if (customerEmail) {
    await emailService.sendPaymentFailedEmail(
      customerEmail,
      paymentIntent.amount,
      errorMessage,
      paymentIntent.id
    );
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Paiement d\'abonnement échoué pour l\'invoice:', invoice.id);
  
  if (invoice.customer_email) {
    // Pour les invoices, on utilise un message générique car l'erreur n'est pas directement accessible
    const errorMessage = 'Échec du paiement de l\'abonnement - veuillez vérifier vos informations de paiement';
    await emailService.sendPaymentFailedEmail(
      invoice.customer_email,
      invoice.amount_due,
      errorMessage,
      invoice.id
    );
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Abonnement supprimé:', subscription.id);
  
  // Récupérer l'email du client depuis les métadonnées ou la base de données
  const customerEmail = subscription.metadata?.customer_email;
  
  if (customerEmail) {
    // Envoyer un email de notification de suppression d'abonnement
    const emailData = {
      to: customerEmail,
      subject: '📋 Abonnement annulé - IA Home',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Abonnement annulé</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">📋 Abonnement annulé</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">IA Home</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour,<br><br>
                Votre abonnement a été annulé. Nous sommes désolés de vous voir partir !
              </p>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px; font-weight: 600;">Que se passe-t-il maintenant ?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                  <li style="margin-bottom: 8px; line-height: 1.5;">Votre accès premium sera maintenu jusqu'à la fin de la période payée</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">Vous ne serez plus facturé automatiquement</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">Vous pouvez réactiver votre abonnement à tout moment</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr'}/abonnements" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Réactiver mon abonnement
                </a>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                L'équipe IA Home<br>
                <a href="mailto:support@iahome.fr" style="color: #f59e0b; text-decoration: none;">support@iahome.fr</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await emailService.sendEmail(emailData);
  }
} 

async function addModuleAccess(userEmail: string, moduleId: string, sessionId: string) {
  try {
    console.log('🔍 Debug - Ajout accès module pour:', userEmail, moduleId);
    
    // Récupérer l'utilisateur depuis auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail);
    
    if (userError || !userData?.user) {
      console.error('❌ Utilisateur non trouvé:', userEmail);
      return;
    }

    // Vérifier si l'accès existe déjà
    const { data: existingAccess, error: checkError } = await supabase
      .from('module_access')
      .select('id')
      .eq('user_id', userData.user.id)
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
        user_id: userData.user.id,
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

async function createSubscriptionForModule(userEmail: string, moduleName: string, sessionId: string) {
  try {
    // Récupérer l'utilisateur depuis auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail);
    
    if (userError || !userData?.user) {
      console.error('Utilisateur non trouvé:', userEmail);
      return;
    }

    // Calculer la date de fin (30 jours par défaut)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Créer l'abonnement
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userData.user.id,
        module_name: moduleName,
        subscription_id: sessionId,
        status: 'active',
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Erreur création abonnement pour:', moduleName, subscriptionError);
    } else {
      console.log('✅ Abonnement créé pour:', moduleName, subscriptionData);
    }
  } catch (error) {
    console.error('Erreur création abonnement:', error);
  }
} 