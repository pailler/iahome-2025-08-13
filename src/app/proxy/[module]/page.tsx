'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ProxyPage({ params }: { params: { module: string } }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setError('Token manquant');
      setLoading(false);
      return;
    }

    const setupIframe = async () => {
      try {
        console.log('🔍 Configuration de l\'iframe pour:', params.module);
        
        // Vérifier que l'utilisateur a accès à ce module
        const response = await fetch(`/api/check-subscription?module=${params.module}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Accès non autorisé à ce module');
        }
        
        // Utiliser l'URL du proxy qui gère l'authentification
        const proxyUrl = `http://localhost:8021/api/proxy-module/?token=${token}&module=${params.module}`;
        
        console.log('✅ URL iframe configurée:', proxyUrl);
        setIframeUrl(proxyUrl);
        
      } catch (err) {
        console.error('❌ Erreur lors de la configuration:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    setupIframe();
  }, [token, params.module]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de {params.module}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <iframe
        src={iframeUrl}
        className="w-full h-full border-0"
        title={`${params.module} - Interface utilisateur`}
        allow="fullscreen"
      />
    </div>
  );
} 