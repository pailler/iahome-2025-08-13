'use client';
import { useState } from 'react';

export default function TestMagicLinkSimplePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testFullCycle = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-magic-link-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test-full-cycle'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        console.log('✅ Test complet réussi:', data);
      } else {
        setError(data.error || 'Erreur lors du test');
        console.error('❌ Erreur test:', data.error);
      }
    } catch (error) {
      setError(`Erreur réseau: ${error}`);
      console.error('❌ Exception test:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-magic-link-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          userId: 'test-user-123',
          moduleName: 'IAmetube'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        console.log('✅ Génération réussie:', data);
      } else {
        setError(data.error || 'Erreur lors de la génération');
        console.error('❌ Erreur génération:', data.error);
      }
    } catch (error) {
      setError(`Erreur réseau: ${error}`);
      console.error('❌ Exception génération:', error);
    } finally {
      setLoading(false);
    }
  };

  const testValidate = async () => {
    if (!result?.generated) {
      setError('Générez d\'abord un magic link');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test-magic-link-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate',
          token: result.generated
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(prev => ({ ...prev, validation: data }));
        console.log('✅ Validation réussie:', data);
      } else {
        setError(data.error || 'Erreur lors de la validation');
        console.error('❌ Erreur validation:', data.error);
      }
    } catch (error) {
      setError(`Erreur réseau: ${error}`);
      console.error('❌ Exception validation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🧪 Test Simple Magic Links
          </h1>

          {/* Boutons de test */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testFullCycle}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '⏳ Test...' : '🔄 Test Complet'}
            </button>
            
            <button
              onClick={testGenerate}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '⏳ Génération...' : '🔗 Générer'}
            </button>
            
            <button
              onClick={testValidate}
              disabled={loading || !result?.generated}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '⏳ Validation...' : '✅ Valider'}
            </button>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Erreur</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Résultats */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                ✅ Test Réussi
              </h3>
              <div className="space-y-4">
                {result.generated && (
                  <div>
                    <strong>Magic Link généré :</strong>
                    <div className="bg-gray-100 p-2 rounded text-sm break-all mt-1">
                      {result.generated}
                    </div>
                  </div>
                )}
                
                {result.validated && (
                  <div>
                    <strong>Données validées :</strong>
                    <div className="bg-gray-100 p-2 rounded text-sm mt-1">
                      <pre>{JSON.stringify(result.validated, null, 2)}</pre>
                    </div>
                  </div>
                )}
                
                {result.testData && (
                  <div>
                    <strong>Données de test :</strong>
                    <div className="bg-gray-100 p-2 rounded text-sm mt-1">
                      <pre>{JSON.stringify(result.testData, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📖 Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li><strong>Test Complet :</strong> Génère et valide un magic link en une seule opération</li>
              <li><strong>Générer :</strong> Crée un nouveau magic link de test</li>
              <li><strong>Valider :</strong> Valide le magic link généré précédemment</li>
              <li>Vérifiez que la variable d'environnement <code>MAGIC_LINK_SECRET</code> est configurée</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 