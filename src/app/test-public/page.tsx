'use client';
import { useState } from 'react';

export default function TestPublic() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testPublicAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      console.log('🧪 Test API publique Stable Diffusion');
      
      // Utiliser l'URL publique de l'API
      const apiResponse = await fetch('https://home.regispailler.fr/api/direct-stablediffusion');
      const content = await apiResponse.text();

      console.log('📡 Réponse API:', apiResponse.status, apiResponse.statusText);
      console.log('📄 Contenu:', content.substring(0, 500) + '...');

      setResponse(`Status: ${apiResponse.status}\n\n${content.substring(0, 1000)}...`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const openPublic = () => {
    window.open('https://home.regispailler.fr/api/direct-stablediffusion', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test API Publique Stable Diffusion</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🧪 Tests</h2>
            
            <div className="space-y-3">
              <button
                onClick={testPublicAPI}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 w-full"
              >
                {loading ? '⏳ Test en cours...' : '🔍 Tester API Publique'}
              </button>

              <button
                onClick={openPublic}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
              >
                🔗 Ouvrir Stable Diffusion Publique
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                ❌ {error}
              </div>
            )}
          </div>

          {/* Section Résultat */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">📊 Résultat</h2>
            
            {response && (
              <div className="bg-gray-100 p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                {response}
              </div>
            )}

            {!response && !error && (
              <div className="text-gray-500 text-center py-8">
                Cliquez sur "Tester API Publique" pour voir le résultat
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">📋 Instructions de test</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Cliquez sur "Tester API Publique" pour vérifier que l'API fonctionne</li>
            <li>Cliquez sur "Ouvrir Stable Diffusion Publique" pour tester l'ouverture</li>
            <li>Vérifiez que Stable Diffusion s'ouvre sans demande de mot de passe</li>
            <li>Vérifiez les logs dans la console du navigateur</li>
          </ol>
        </div>

        {/* URL de test */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">🔗 URL de test</h3>
          <div className="bg-yellow-100 p-3 rounded font-mono text-sm">
            https://home.regispailler.fr/api/direct-stablediffusion
          </div>
          <p className="text-sm text-yellow-800 mt-2">
            Cette URL devrait ouvrir Stable Diffusion avec authentification automatique.
          </p>
        </div>
      </div>
    </div>
  );
} 