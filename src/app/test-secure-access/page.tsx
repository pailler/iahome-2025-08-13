'use client';
import { useState } from 'react';

export default function TestSecureAccess() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSecureAccess = async (module: string) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🧪 Test accès sécurisé pour:', module);

      const response = await fetch('/api/generate-access-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module: module,
          duration: 5 // 5 minutes pour le test
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setResult(data);
      console.log('✅ Test réussi:', data);

    } catch (error) {
      console.error('❌ Erreur test:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test Système d'Accès Sécurisé</h1>

        {/* Tests des modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Stable Diffusion</h3>
            <button
              onClick={() => testSecureAccess('stablediffusion')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? '⏳ Génération...' : '🔐 Générer URL sécurisée'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📹 IA Tube</h3>
            <button
              onClick={() => testSecureAccess('iatube')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? '⏳ Génération...' : '🔐 Générer URL sécurisée'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎵 IA Metube</h3>
            <button
              onClick={() => testSecureAccess('iametube')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? '⏳ Génération...' : '🔐 Générer URL sécurisée'}
            </button>
          </div>
        </div>

        {/* Résultats */}
        {result && (
          <div className="bg-white p-6 rounded-lg border border-green-200 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">✅ URL Sécurisée Générée</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Module:</span>
                <span className="ml-2 text-gray-900">{result.module}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">URL d'accès:</span>
                <div className="mt-1 p-2 bg-gray-100 rounded font-mono text-sm break-all">
                  {result.accessUrl}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Token:</span>
                <div className="mt-1 p-2 bg-gray-100 rounded font-mono text-xs break-all">
                  {result.token}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Expire le:</span>
                <span className="ml-2 text-gray-900">{new Date(result.expiresAt).toLocaleString('fr-FR')}</span>
              </div>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => window.open(result.accessUrl, '_blank')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔗 Tester l'URL générée
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(result.accessUrl)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ml-2"
                >
                  📋 Copier l'URL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-white p-6 rounded-lg border border-red-200 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">❌ Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Informations sur le système */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🔒 Fonctionnalités du Système Sécurisé</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">✅ Sécurité</h4>
              <ul className="space-y-1">
                <li>• URLs temporaires uniques</li>
                <li>• Expiration automatique</li>
                <li>• Tokens cryptographiques</li>
                <li>• Aucune URL visible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🚀 Performance</h4>
              <ul className="space-y-1">
                <li>• Génération instantanée</li>
                <li>• Authentification automatique</li>
                <li>• Proxy transparent</li>
                <li>• Nettoyage automatique</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Retour */}
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
} 