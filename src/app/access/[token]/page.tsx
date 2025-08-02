'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function SecureAccess() {
  const params = useParams();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleInfo, setModuleInfo] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadSecureModule = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔐 Chargement module sécurisé avec token:', token);

        // Charger le module via l'API sécurisée
        if (iframeRef.current) {
          iframeRef.current.src = `/api/generate-access-url?token=${token}`;
        }

        // Simuler un délai pour l'affichage
        setTimeout(() => {
          setLoading(false);
        }, 2000);

      } catch (error) {
        console.error('❌ Erreur chargement module sécurisé:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
        setLoading(false);
      }
    };

    if (token) {
      loadSecureModule();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Accès sécurisé en cours...</h1>
          <p className="text-gray-400 mb-4">Vérification du token et chargement du module</p>
          <div className="bg-gray-800 p-4 rounded-lg max-w-md mx-auto">
            <div className="text-sm text-gray-300 mb-2">Token de sécurité:</div>
            <div className="font-mono text-blue-400 text-xs break-all">
              {token ? `${token.substring(0, 8)}...${token.substring(token.length - 8)}` : 'Chargement...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Erreur d'accès</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              ← Retour
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors w-full"
            >
              🔄 Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header sécurisé */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">

            <div className="h-6 w-px bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Accès sécurisé</span>
              <div className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs font-medium">
                🔒 Sécurisé
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500">
              Token: {token ? `${token.substring(0, 8)}...` : 'N/A'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-gray-400 hover:text-white transition-colors"
              title="Recharger"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Module sécurisé */}
      <div className="w-full h-[calc(100vh-80px)]">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Module sécurisé"
          allow="camera; microphone; geolocation; encrypted-media"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>

      {/* Indicateur de sécurité */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm max-w-xs">
        <div className="font-semibold mb-2">🔒 Accès sécurisé</div>
        <div className="space-y-1 text-xs">
          <div>• Token temporaire généré</div>
          <div>• Authentification automatique</div>
          <div>• Expiration automatique</div>
          <div>• Aucune URL visible</div>
        </div>
      </div>
    </div>
  );
} 