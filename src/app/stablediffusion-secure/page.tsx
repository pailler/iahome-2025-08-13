'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import AuthGuard from '../../components/AuthGuard';

export default function StableDiffusionSecure() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (token && user) {
      generateAccessToken();
    }
  }, [token, user]);

  const generateAccessToken = async () => {
    if (!user) {
      setError('Vous devez être connecté pour accéder à Stable Diffusion');
      return;
    }

    setGeneratingToken(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleName: 'stablediffusion',
          userId: user.id,
          duration: 24
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAccessToken(data.accessToken);
        console.log('✅ Token d\'accès généré:', data);
        
        // Rediriger vers le proxy avec le token
        const proxyUrl = `/stablediffusion-proxy?token=${data.accessToken}`;
        window.location.href = proxyUrl;
      } else {
        setError(data.error || 'Erreur lors de la génération du token');
      }
    } catch (error) {
      console.error('❌ Erreur génération token:', error);
      setError('Erreur lors de la génération du token d\'accès');
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleDirectAccess = () => {
    if (!user) {
      setError('Vous devez être connecté pour accéder à Stable Diffusion');
      return;
    }
    generateAccessToken();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard moduleName="stablediffusion" requireSubscription={true}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🔐 Accès sécurisé - Stable Diffusion
              </h1>
              <p className="text-gray-600">
                Accédez à Stable Diffusion en toute sécurité avec votre abonnement.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Option 1: Accès direct */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  🚀 Accès direct
                </h3>
                <p className="text-blue-700 mb-4">
                  Accédez directement à Stable Diffusion avec un token d'accès temporaire.
                </p>
                
                <button
                  onClick={handleDirectAccess}
                  disabled={generatingToken}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generatingToken ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      Génération en cours...
                    </>
                  ) : (
                    'Accéder à Stable Diffusion'
                  )}
                </button>
                
                <div className="mt-4 text-sm text-blue-600">
                  <p>• Token valide 24 heures</p>
                  <p>• Accès sécurisé et authentifié</p>
                  <p>• Redirection automatique</p>
                </div>
              </div>

              {/* Option 2: Gestion des tokens */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 mb-4">
                  🔑 Gestion des tokens
                </h3>
                <p className="text-green-700 mb-4">
                  Gérez vos tokens d'accès et obtenez des URLs personnalisées.
                </p>
                
                <button
                  onClick={() => router.push('/secure-module-access?module=stablediffusion')}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
                >
                  Gérer les tokens
                </button>
                
                <div className="mt-4 text-sm text-green-600">
                  <p>• Génération de tokens</p>
                  <p>• URLs personnalisées</p>
                  <p>• Historique d'accès</p>
                </div>
              </div>
            </div>

            {/* Informations de sécurité */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔒 Sécurité et confidentialité
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Protection des données :</h4>
                  <ul className="space-y-1">
                    <li>• Tokens chiffrés et sécurisés</li>
                    <li>• Expiration automatique</li>
                    <li>• Audit des accès</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Authentification :</h4>
                  <ul className="space-y-1">
                    <li>• Vérification des abonnements</li>
                    <li>• Sessions sécurisées</li>
                    <li>• Protection contre les accès non autorisés</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← Retour à l'accueil
              </button>
              
              <button
                onClick={() => router.push('/abonnements?module=stablediffusion')}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                Gérer l'abonnement
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 