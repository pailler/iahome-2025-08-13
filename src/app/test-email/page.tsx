'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [emailType, setEmailType] = useState('payment');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Récupérer la session utilisateur
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userEmail = session.user.email || '';
        setUserEmail(userEmail);
        setEmail(userEmail);
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
          const userEmail = session.user.email || '';
          setUserEmail(userEmail);
          setEmail(userEmail);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    console.log('🔍 Debug - handleSubmit appelé:', { email, emailType, userEmail, isLoggedIn });

    try {
      const requestBody = {
        email,
        type: emailType,
      };
      
      console.log('🔍 Debug - Request body:', requestBody);
      console.log('🔍 Debug - Email utilisé pour le test:', email);

      const response = await fetch('/api/test-email', {
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
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              📧 Test Email - IA Home
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
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            📧 Test Email - IA Home
          </h1>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">
              <strong>Email de test :</strong> {userEmail}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email de destination
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre email"
                required
              />
            </div>

            <div>
              <label htmlFor="emailType" className="block text-sm font-medium text-gray-700 mb-2">
                Type d'email
              </label>
              <select
                id="emailType"
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="payment">Paiement Réussi</option>
                <option value="subscription">Abonnement Activé</option>
                <option value="failed">Paiement Échoué</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? '⏳ Envoi...' : '📧 Envoyer Email de Test'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.startsWith('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="font-medium">{result}</p>
            </div>
          )}

          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Types d'Emails Disponibles
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>• <strong>Paiement Réussi :</strong> Email de confirmation avec détails du paiement</p>
              <p>• <strong>Abonnement Activé :</strong> Email de bienvenue premium avec accès</p>
              <p>• <strong>Paiement Échoué :</strong> Email d'échec avec instructions de récupération</p>
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