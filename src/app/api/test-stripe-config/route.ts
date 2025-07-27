import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    console.log('🔍 Test configuration Stripe');
    
    // Vérifier les variables d'environnement
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
    const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const secretKeyLength = process.env.STRIPE_SECRET_KEY?.length || 0;
    const publishableKeyLength = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0;
    
    console.log('🔍 Variables d\'environnement:', {
      hasSecretKey,
      hasPublishableKey,
      secretKeyLength,
      publishableKeyLength
    });
    
    if (!hasSecretKey) {
      return NextResponse.json({
        error: 'STRIPE_SECRET_KEY manquante',
        details: {
          hasSecretKey,
          hasPublishableKey,
          secretKeyLength,
          publishableKeyLength
        }
      }, { status: 400 });
    }
    
    // Tester la connexion Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
    });
    
    // Tester une requête simple vers Stripe
    const account = await stripe.accounts.retrieve();
    
    console.log('✅ Connexion Stripe réussie');
    
    return NextResponse.json({
      success: true,
      message: 'Configuration Stripe OK',
      account: {
        id: account.id,
        business_type: account.business_type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled
      },
      config: {
        hasSecretKey,
        hasPublishableKey,
        secretKeyLength,
        publishableKeyLength
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test configuration Stripe:', error);
    
    return NextResponse.json({
      error: 'Erreur configuration Stripe',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      config: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
        publishableKeyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0
      }
    }, { status: 500 });
  }
} 