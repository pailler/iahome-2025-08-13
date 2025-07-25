import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    const result = {
      secretKeyConfigured: !!secretKey,
      publicKeyConfigured: !!publicKey,
      secretKeyPrefix: secretKey ? secretKey.substring(0, 7) + '...' : 'Non configurée',
      publicKeyPrefix: publicKey ? publicKey.substring(0, 7) + '...' : 'Non configurée',
      errors: [] as string[]
    };

    // Vérifier si les clés sont présentes
    if (!secretKey) {
      result.errors.push('Clé secrète Stripe manquante (STRIPE_SECRET_KEY)');
    }
    
    if (!publicKey) {
      result.errors.push('Clé publique Stripe manquante (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)');
    }

    // Tester la connexion Stripe si la clé secrète est présente
    if (secretKey) {
      try {
        const stripe = new Stripe(secretKey, {
          apiVersion: '2023-10-16',
        });
        
        // Test simple de connexion
        const account = await stripe.accounts.retrieve();
        result.stripeConnection = '✅ Connexion Stripe réussie';
        result.accountId = account.id;
      } catch (stripeError) {
        result.stripeConnection = '❌ Erreur de connexion Stripe';
        result.errors.push(`Erreur Stripe: ${stripeError instanceof Error ? stripeError.message : 'Erreur inconnue'}`);
      }
    } else {
      result.stripeConnection = '❌ Impossible de tester (clé manquante)';
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: 'Erreur lors du test de configuration',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 