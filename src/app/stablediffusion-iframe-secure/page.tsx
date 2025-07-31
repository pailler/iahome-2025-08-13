'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function StableDiffusionIframeSecure() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Vérifier l'authentification
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

  // Vérifier l'abonnement et générer l'URL sécurisée
  useEffect(() => {
    const checkSubscriptionAndGenerateUrl = async () => {
      if (!user?.id) return;

      try {
        // Temporairement, générer directement le token d'accès sans vérifier l'abonnement
        console.log('🔐 Génération du token d\'accès pour Stable Diffusion...');
        
        const tokenResponse = await fetch('/api/generate-module-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            moduleName: 'stablediffusion',
            userId: user.id
          }),
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          console.log('✅ Token généré avec succès');
          // Créer l'URL de l'iframe avec le token
          const secureUrl = `/api/stablediffusion-proxy?token=${tokenData.token}`;
          setIframeUrl(secureUrl);
        } else {
          console.error('❌ Erreur lors de la génération du token');
          const errorData = await tokenResponse.json();
          setError(`Erreur lors de la génération du token d'accès: ${errorData.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        console.error('❌ Erreur:', error);
        setError('Erreur de connexion lors de la génération du token');
      }
    };

    if (user) {
      checkSubscriptionAndGenerateUrl();
    }
  }, [user]);

  // Rediriger si non authentifié
  useEffect(() => {
    if (!loading && !session) {
      router.push('/login?redirect=/stablediffusion-iframe-secure');
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirection en cours
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-red-900 border border-red-700 rounded-lg p-8 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-red-200 mb-4">Accès Refusé</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/abonnements?module=stablediffusion')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Voir les abonnements
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header avec informations utilisateur */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">🎨 Stable Diffusion</h1>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">Connecté en tant que {user?.email}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-300 hover:text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              ← Retour
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="text-gray-300 hover:text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      {/* Iframe sécurisée */}
      <div className="relative w-full h-[calc(100vh-80px)]">
        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            title="Stable Diffusion - Interface sécurisée"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white">Chargement de Stable Diffusion...</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay de sécurité (optionnel) */}
      <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs text-gray-300">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Session sécurisée active</span>
        </div>
      </div>
    </div>
  );
} 