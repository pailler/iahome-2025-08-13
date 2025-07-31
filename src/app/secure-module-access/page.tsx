'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import AuthGuard from '../../components/AuthGuard';

export default function SecureModuleAccess() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moduleInfo, setModuleInfo] = useState<any>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get('module') || 'stablediffusion';

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

  const generateAccessToken = async () => {
    if (!user) {
      setError('Vous devez être connecté pour générer un token d\'accès');
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
          moduleName,
          userId: user.id,
          duration: 24 // 24 heures
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAccessToken(data.accessToken);
        setModuleInfo(data.subscription);
        console.log('✅ Token d\'accès généré:', data);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Token copié dans le presse-papiers !');
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const getModuleDisplayName = (name: string) => {
    switch (name) {
      case 'stablediffusion':
        return 'Stable Diffusion';
      case 'module':
        return 'Module Générique';
      default:
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };

  const getModuleUrl = (name: string, token: string) => {
    switch (name) {
      case 'stablediffusion':
        return `/stablediffusion-proxy?token=${token}`;
      case 'module':
        return `/module?token=${token}`;
      default:
        return `/${name}?token=${token}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard moduleName={moduleName} requireSubscription={true}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Accès sécurisé - {getModuleDisplayName(moduleName)}
              </h1>
              <p className="text-gray-600">
                Générez un token d'accès temporaire pour utiliser ce module en toute sécurité.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {!accessToken ? (
              <div className="text-center">
                <button
                  onClick={generateAccessToken}
                  disabled={generatingToken}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generatingToken ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      Génération en cours...
                    </>
                  ) : (
                    'Générer un token d\'accès'
                  )}
                </button>
                
                <div className="mt-6 text-sm text-gray-500">
                  <p>• Le token sera valide pendant 24 heures</p>
                  <p>• Vous devez avoir un abonnement actif</p>
                  <p>• Le token est unique et sécurisé</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    ✅ Token d'accès généré avec succès !
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Token d'accès :
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={accessToken}
                          readOnly
                          className="flex-1 p-3 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(accessToken)}
                          className="px-4 py-3 bg-gray-600 text-white rounded-r-md hover:bg-gray-700 transition-colors"
                        >
                          Copier
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL d'accès direct :
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={`${window.location.origin}${getModuleUrl(moduleName, accessToken)}`}
                          readOnly
                          className="flex-1 p-3 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}${getModuleUrl(moduleName, accessToken)}`)}
                          className="px-4 py-3 bg-gray-600 text-white rounded-r-md hover:bg-gray-700 transition-colors"
                        >
                          Copier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {moduleInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Informations d'abonnement :</h4>
                    <div className="text-sm text-blue-700">
                      <p>• Statut : {moduleInfo.status}</p>
                      <p>• Expire le : {new Date(moduleInfo.endDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => window.open(getModuleUrl(moduleName, accessToken), '_blank')}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Ouvrir le module
                  </button>
                  
                  <button
                    onClick={() => {
                      setAccessToken(null);
                      setModuleInfo(null);
                      setError(null);
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Générer un nouveau token
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => router.push('/')}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    ← Retour à l'accueil
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 