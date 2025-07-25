import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== DÉBUT CRÉATION SESSION STRIPE ===');
    
    // Vérifier si Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Clé secrète Stripe manquante');
      return NextResponse.json(
        { error: 'Stripe n\'est pas configuré côté serveur' },
        { status: 500 }
      );
    }

    const { amount, items, customerEmail } = await request.json();
    console.log('Données reçues:', { amount, itemsCount: items?.length, customerEmail });

    // Vérifier si des articles sont présents
    if (!items || items.length === 0) {
      console.error('Aucun article fourni');
      return NextResponse.json(
        { error: 'Aucun article fourni' },
        { status: 400 }
      );
    }

    console.log('Articles à traiter:', items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price
    })));

    // Créer une session de paiement Stripe
    console.log('Création de la session Stripe...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.title || 'Article sans titre',
            description: item.description || 'Aucune description',
          },
          unit_amount: Math.round((item.price || 0) * 100), // Stripe utilise les centimes
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `https://home.regispailler.fr?payment=success`,
      cancel_url: `${request.nextUrl.origin}/abonnements?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        items: JSON.stringify(items.map((item: any) => ({ id: item.id, title: item.title }))),
      },
    });

    console.log('Session Stripe créée avec succès:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    
    // Retourner des détails sur l'erreur pour le débogage
    let errorMessage = 'Erreur lors de la création du paiement';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Pas de détails disponibles'
      },
      { status: 500 }
    );
  }
} 