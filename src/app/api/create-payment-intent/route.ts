import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug - API create-payment-intent appelée');
    console.log('🔍 Debug - STRIPE_SECRET_KEY existe:', !!process.env.STRIPE_SECRET_KEY);
    console.log('🔍 Debug - STRIPE_SECRET_KEY longueur:', process.env.STRIPE_SECRET_KEY?.length);
    
    const body = await request.json();
    const { items, customerEmail, type } = body;

    console.log('🔍 Debug - Création session Stripe:', { items, customerEmail, type });
    console.log('🔍 Debug - Body complet:', body);

    if (!customerEmail) {
      console.error('❌ Erreur - Email client manquant');
      return NextResponse.json(
        { error: 'Email client requis' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      console.error('❌ Erreur - Items manquants');
      return NextResponse.json(
        { error: 'Items requis' },
        { status: 400 }
      );
    }

    // Calculer le montant total à partir des items
    const totalAmount = items.reduce((total: number, item: any) => total + (item.price || 0), 0);
    
    if (totalAmount <= 0) {
      console.error('❌ Erreur - Montant total invalide:', totalAmount);
      return NextResponse.json(
        { error: 'Montant total invalide' },
        { status: 400 }
      );
    }

    console.log('🔍 Debug - Validation OK, création session...');

    // Créer une session de paiement avec les métadonnées
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round((item.price || 0) * 100), // Convertir en centimes
        },
        quantity: 1,
      })),
      mode: type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8021'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8021'}/cancel`,
      customer_email: customerEmail,
      metadata: {
        customer_email: customerEmail,
        items: JSON.stringify(items),
        type: type,
      },
    });

    console.log('🔍 Debug - Session créée:', session.id);
    console.log('🔍 Debug - URL session:', session.url);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Erreur création session Stripe:', error);
    console.error('❌ Détails erreur:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
} 