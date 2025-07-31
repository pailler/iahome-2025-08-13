'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function TestProxy() {
  const [jwt, setJwt] = useState<string | null>(null);
  const [proxyResponse, setProxyResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateJWT = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Vous devez être connecté');
        return;
      }

      const response = await fetch('/api/fusionauth-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session.user.id, 
          userEmail: session.user.email, 
          module: 'stablediffusion' 
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur génération JWT');
      }

      const data = await response.json();
      setJwt(data.jwt);
      console.log('✅ JWT généré:', data.jwt);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const testProxy = async () => {
    if (!jwt) {
      setError('Générez d\'abord un JWT');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const proxyUrl = `/api/proxy-stablediffusion?jwt=${jwt}&path=/`;
      console.log('🔗 Test proxy:', proxyUrl);

      const response = await fetch(proxyUrl);
      const content = await response.text();

      console.log('📡 Réponse proxy:', response.status, response.statusText);
      console.log('📄 Contenu:', content.substring(0, 500) + '...');

      setProxyResponse(`Status: ${response.status}\n\n${content.substring(0, 1000)}...`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur proxy');
    } finally {
      setLoading(false);
    }
  };

  const openDirect = () => {
    if (jwt) {
      const url = `https://stablediffusion.regispailler.fr?jwt=${jwt}`;
      window.open(url, '_blank');
    }
  };

  const openProxy = () => {
    if (jwt) {
      const url = `/api/proxy-stablediffusion?jwt=${jwt}&path=/`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test Proxy Stable Diffusion</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section JWT */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🔐 Génération JWT</h2>
            
            <button
              onClick={generateJWT}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {loading ? '⏳ Génération...' : '🔑 Générer JWT'}
            </button>

            {jwt && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">JWT généré :</p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all">
                  {jwt.substring(0, 100)}...
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                ❌ {error}
              </div>
            )}
          </div>

          {/* Section Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🧪 Tests</h2>
            
            <div className="space-y-3">
              <button
                onClick={testProxy}
                disabled={!jwt || loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 w-full"
              >
                {loading ? '⏳ Test en cours...' : '🔍 Tester Proxy'}
              </button>

              <button
                onClick={openDirect}
                disabled={!jwt}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full"
              >
                🔗 Ouvrir Direct
              </button>

              <button
                onClick={openProxy}
                disabled={!jwt}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 w-full"
              >
                🔄 Ouvrir Proxy
              </button>
            </div>

            {proxyResponse && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Réponse du proxy :</p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {proxyResponse}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">📋 Instructions de test</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Cliquez sur "Générer JWT" pour créer un token d'authentification</li>
            <li>Cliquez sur "Tester Proxy" pour vérifier que le proxy fonctionne</li>
            <li>Cliquez sur "Ouvrir Direct" pour tester l'ouverture directe</li>
            <li>Cliquez sur "Ouvrir Proxy" pour tester l'ouverture via proxy</li>
            <li>Vérifiez les logs dans la console du navigateur</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 