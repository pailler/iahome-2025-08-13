'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function TestRealPaymentPage() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    // Récupérer la session utilisateur
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || '');
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    getSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email || '');
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createPaymentSession = async (type: 'payment' | 'subscription') => {
    if (!isLoggedIn) {
      setResult('❌ Veuillez vous connecter pour tester les paiements');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      console.log('🔍 Debug - Création session paiement:', { type, userEmail });

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 2999, // 29.99€
          items: [
            { title: 'Formation IA Avancée' },
            { title: 'Templates Premium' }
          ],
          customerEmail: userEmail,
          type: type
        }),
      });

      const data = await response.json();
      console.log('🔍 Debug - Réponse API:', data);

      if (response.ok && data.url) {
        setResult(`✅ Session créée ! Redirection vers Stripe...`);
        // Rediriger vers Stripe
        window.location.href = data.url;
      } else {
        setResult(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('🔍 Debug - Erreur:', error);
      setResult(`❌ Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              💳 Test Paiements Réels Stripe
            </h1>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                🔐 Connexion Requise
              </h2>
              <p className="text-yellow-700 mb-4">
                Vous devez être connecté pour tester les vrais paiements avec votre email.
              </p>
              <a 
                href="/login" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Se Connecter
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            💳 Test Paiements Réels Stripe
          </h1>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">
              <strong>Email de paiement :</strong> {userEmail}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                💳 Paiement Unique
              </h2>
              <p className="text-blue-700 mb-4">
                Teste un paiement unique de 29.99€ qui déclenchera un webhook Stripe.
              </p>
              <button
                onClick={() => createPaymentSession('payment')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? '⏳ Création...' : '💳 Tester Paiement Unique'}
              </button>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">
                🔄 Abonnement
              </h2>
              <p className="text-purple-700 mb-4">
                Teste un abonnement mensuel de 29.99€ qui déclenchera des webhooks Stripe.
              </p>
              <button
                onClick={() => createPaymentSession('subscription')}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? '⏳ Création...' : '🔄 Tester Abonnement'}
              </button>
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.startsWith('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="font-medium">{result}</p>
            </div>
          )}

          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Instructions de Test
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>• <strong>Paiement Unique :</strong> Crée une session Stripe pour un paiement unique</p>
              <p>• <strong>Abonnement :</strong> Crée une session Stripe pour un abonnement récurrent</p>
              <p>• <strong>Webhooks :</strong> Les paiements déclencheront les webhooks Stripe</p>
              <p>• <strong>Emails :</strong> Les webhooks enverront les emails de confirmation</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🔧 Configuration Actuelle</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Email Provider: <code className="bg-blue-100 px-1 rounded">console</code></p>
              <p>• From Email: <code className="bg-blue-100 px-1 rounded">noreply@iahome.fr</code></p>
              <p>• App URL: <code className="bg-blue-100 px-1 rounded">http://localhost:8021</code></p>
              <p>• Utilisateur connecté: <code className="bg-blue-100 px-1 rounded">{userEmail}</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 