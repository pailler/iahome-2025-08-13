'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StableDiffusionDirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirection automatique vers l'API directe
    const openStableDiffusion = () => {
      try {
        console.log('🔗 Ouverture Stable Diffusion via API directe');
        window.open('/api/direct-stablediffusion', '_blank');
        
        // Retour à l'accueil après un délai
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        console.error('❌ Erreur ouverture:', error);
        setError('Erreur lors de l\'ouverture de Stable Diffusion');
      } finally {
        setLoading(false);
      }
    };

    openStableDiffusion();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ouverture de Stable Diffusion...</p>
          <p className="text-sm text-gray-500 mt-2">Authentification automatique en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Erreur d'accès</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Accès réussi !</h1>
        <p className="text-gray-600 mb-4">
          Stable Diffusion s'ouvre dans un nouvel onglet avec authentification automatique.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.open('/api/direct-stablediffusion', '_blank')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            🔄 Rouvrir Stable Diffusion
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors w-full"
          >
            ← Retour à l'accueil
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>✅ Authentification automatique :</strong>
            <br />
            Les credentials sont injectés automatiquement côté serveur.
            <br />
            Aucun mot de passe à saisir !
          </p>
        </div>
      </div>
    </div>
  );
} 