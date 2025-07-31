'use client';
import { useEffect, useRef } from 'react';

export default function StableDiffusionProxyPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log('🔐 Chargement Stable Diffusion via proxy');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Stable Diffusion</span>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Proxy avec authentification
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title="Recharger"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Iframe avec proxy */}
      <div className="w-full h-[calc(100vh-80px)]">
        <iframe
          ref={iframeRef}
          src="/api/stablediffusion-proxy"
          className="w-full h-full border-0"
          title="Stable Diffusion"
          allow="camera; microphone; geolocation; encrypted-media"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm max-w-xs">
        <div className="font-semibold mb-2">🔐 Proxy avec authentification</div>
        <div className="space-y-1 text-xs">
          <div>• Contenu récupéré côté serveur</div>
          <div>• Authentification automatique injectée</div>
          <div>• Soumission automatique du formulaire</div>
          <div>• Si problème, utilisez :</div>
          <div className="bg-gray-800 p-1 rounded font-mono">
            admin / Rasulova75
          </div>
        </div>
      </div>
    </div>
  );
} 