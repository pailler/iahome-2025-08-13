'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StableDiffusionRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirection automatique vers Stable Diffusion
    const redirectToStableDiffusion = () => {
      try {
        console.log('🔗 Redirection vers Stable Diffusion');
        
        // Redirection vers l'API de redirection
        window.location.href = '/api/stablediffusion-redirect';
      } catch (error) {
        console.error('❌ Erreur redirection:', error);
      } finally {
        setLoading(false);
      }
    };

    // Délai pour montrer le loading
    setTimeout(() => {
      redirectToStableDiffusion();
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers Stable Diffusion...</p>
          <p className="text-sm text-gray-500 mt-2">Authentification automatique en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-blue-500 text-6xl mb-4">⏳</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Redirection en cours...</h1>
        <p className="text-gray-600 mb-4">
          Si la redirection automatique ne fonctionne pas, cliquez sur le bouton ci-dessous.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/api/stablediffusion-redirect'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            🔄 Rediriger vers Stable Diffusion
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors w-full"
          >
            ← Retour à l'accueil
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>✅ Authentification automatique :</strong>
            <br />
            Les credentials admin/Rasulova75 sont inclus dans l'URL.
            <br />
            Aucun mot de passe à saisir !
          </p>
        </div>
      </div>
    </div>
  );
} 