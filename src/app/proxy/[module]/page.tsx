'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ProxyPage({ params }: { params: { module: string } }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setError('Token manquant');
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        console.log('🔍 Chargement du contenu via proxy pour:', params.module);
        
        // Charger la page principale via le proxy
        const response = await fetch(`/api/proxy-module/?token=${token}&module=${params.module}`);
        
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log('✅ Contenu chargé avec succès');
        
        // Modifier le HTML pour intercepter toutes les requêtes
        const modifiedHtml = html.replace(
          /(src|href)=["']([^"']*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))["']/g,
          (match, attr, url) => {
            // Si c'est une URL relative, la transformer en requête proxy
            if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
              const proxyUrl = `/api/proxy-module/${url}?token=${token}&module=${params.module}`;
              return `${attr}="${proxyUrl}"`;
            }
            // Si c'est une URL absolue du même domaine, la transformer aussi
            if (url.includes('stablediffusion.regispailler.fr')) {
              const path = new URL(url).pathname;
              const proxyUrl = `/api/proxy-module${path}?token=${token}&module=${params.module}`;
              return `${attr}="${proxyUrl}"`;
            }
            return match;
          }
        );
        
        setContent(modifiedHtml);
        
      } catch (err) {
        console.error('❌ Erreur lors du chargement:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
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
    <div 
      dangerouslySetInnerHTML={{ __html: content }}
      className="w-full h-full"
    />
  );
} 