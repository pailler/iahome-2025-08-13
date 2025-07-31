'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleStableDiffusion() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ouverture directe de Stable Diffusion
    const openStableDiffusion = () => {
      try {
        console.log('🔗 Ouverture directe Stable Diffusion');
        
        // Ouvrir directement l'API qui gère l'authentification
        window.open('/api/direct-stablediffusion', '_blank');
        
        // Retour à l'accueil après un délai
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (error) {
        console.error('❌ Erreur ouverture:', error);
      } finally {
        setLoading(false);
      }
    };

    // Délai pour montrer le loading
    setTimeout(() => {
      openStableDiffusion();
    }, 1000);
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Accès réussi !</h1>
        <p className="text-gray-600 mb-4">
          Stable Diffusion s'ouvre dans un nouvel onglet.
          <br />
          L'authentification est gérée automatiquement côté serveur.
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
            Les credentials admin/Rasulova75 sont injectés automatiquement.
            <br />
            Aucun mot de passe à saisir !
          </p>
        </div>
      </div>
    </div>
  );
} 