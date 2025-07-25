'use client';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface StripeCheckoutProps {
  items: any[];
  customerEmail?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function StripeCheckout({ items, customerEmail, onSuccess, onError }: StripeCheckoutProps) {
  const handleCheckout = async () => {
    try {
      // Vérifier si Stripe est configuré
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Stripe n\'est pas configuré. Veuillez configurer les clés Stripe.');
      }

      // Vérifier si des articles sont présents
      if (!items || items.length === 0) {
        throw new Error('Aucun article à acheter.');
      }

      // Créer la session de paiement
      console.log('Envoi des données vers l\'API:', {
        itemsCount: items.length,
        items: items.map(item => ({ id: item.id, title: item.title, price: item.price })),
        customerEmail
      });

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerEmail,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Réponse API non-OK:', response.status, errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const { sessionId, error, details } = await response.json();

      if (error) {
        console.error('Erreur API:', { error, details });
        throw new Error(`Erreur API: ${error}`);
      }

      // Rediriger vers Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      } else {
        throw new Error('Impossible de charger Stripe.');
      }
    } catch (error) {
      console.error('Erreur lors du checkout:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur lors du paiement');
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
    >
      Activer les abonnements
    </button>
  );
} 