'use client';
import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ProxyPage({ params }: { params: Promise<{ module: string }> }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Unwrapper les paramètres avec React.use()
  const { module } = use(params);

  useEffect(() => {
    if (!token) {
      setError('Token manquant');
      setLoading(false);
      return;
    }

    const setupIframe = async () => {
      try {
        console.log('🔍 Configuration de l\'iframe pour:', module);
        
        // Utiliser directement l'URL du proxy qui gère l'authentification
        const proxyUrl = `https://iahome.fr/api/proxy-module/?token=${token}&module=${module}`;
        
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
  }, [token, module]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de {module}...</p>
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

        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <iframe
        src={iframeUrl}
        className="w-full h-full border-0"
        title={`${module} - Interface utilisateur`}
        allow="fullscreen"
      />
    </div>
  );
} 