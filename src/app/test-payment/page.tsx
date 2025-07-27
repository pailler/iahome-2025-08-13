'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function TestPaymentPage() {
  const [loadingStates, setLoadingStates] = useState({
    payment: false,
    failed: false,
    subscription: false,
    cancelled: false
  });
  const [result, setResult] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const simulatePayment = async (type: 'payment' | 'subscription' | 'failed' | 'cancelled') => {
    if (!isLoggedIn) {
      setResult('❌ Veuillez vous connecter pour tester les emails');
      return;
    }

    console.log('🔍 Debug - simulatePayment appelé:', { type, userEmail, isLoggedIn });
    
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    setResult('');

    try {
      const requestBody = {
        type,
        email: userEmail,
        amount: 2999, // 29.99€
        items: [
          { title: 'Formation IA Avancée' },
          { title: 'Templates Premium' }
        ]
      };
      
      console.log('🔍 Debug - Request body:', requestBody);
      console.log('🔍 Debug - Email utilisé pour le test:', userEmail);

      const response = await fetch('/api/test-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔍 Debug - Response status:', response.status);
      
      const data = await response.json();
      console.log('🔍 Debug - Response data:', data);
      
      if (response.ok) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('🔍 Debug - Erreur fetch:', error);
      setResult(`❌ Erreur: ${error}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              🧪 Test Paiements & Abonnements Stripe
            </h1>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                🔐 Connexion Requise
              </h2>
              <p className="text-yellow-700 mb-4">
                Vous devez être connecté pour tester les emails avec votre adresse email.
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 Test Paiements & Abonnements Stripe
          </h1>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">
              <strong>Email de test :</strong> {userEmail}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                💳 Paiements
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => simulatePayment('payment')}
                  disabled={loadingStates.payment || loadingStates.failed || loadingStates.subscription || loadingStates.cancelled}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {loadingStates.payment ? '⏳ Envoi...' : '✅ Simuler Paiement Réussi'}
                </button>
                <button
                  onClick={() => simulatePayment('failed')}
                  disabled={loadingStates.payment || loadingStates.failed || loadingStates.subscription || loadingStates.cancelled}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {loadingStates.failed ? '⏳ Envoi...' : '❌ Simuler Paiement Échoué'}
                </button>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">
                🔄 Abonnements
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => simulatePayment('subscription')}
                  disabled={loadingStates.payment || loadingStates.failed || loadingStates.subscription || loadingStates.cancelled}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {loadingStates.subscription ? '⏳ Envoi...' : '✅ Simuler Abonnement Actif'}
                </button>
                <button
                  onClick={() => simulatePayment('cancelled')}
                  disabled={loadingStates.payment || loadingStates.failed || loadingStates.subscription || loadingStates.cancelled}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {loadingStates.cancelled ? '⏳ Envoi...' : '📋 Simuler Abonnement Annulé'}
                </button>
              </div>
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
              <p>• <strong>Paiement Réussi :</strong> Envoie un email de confirmation de paiement</p>
              <p>• <strong>Paiement Échoué :</strong> Envoie un email d'échec avec instructions</p>
              <p>• <strong>Abonnement Actif :</strong> Envoie un email de bienvenue premium</p>
              <p>• <strong>Abonnement Annulé :</strong> Envoie un email de notification d'annulation</p>
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