'use client';

import { useState } from 'react';

export default function TestFormInjection() {
  const [module, setModule] = useState('stablediffusion');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [debugMode, setDebugMode] = useState(true);
  const [customCredentials, setCustomCredentials] = useState({
    username: 'admin',
    password: 'Rasulova75'
  });

  const modules = [
    { value: 'stablediffusion', label: 'StableDiffusion' },
    { value: 'iatube', label: 'IATube' },
    { value: 'iametube', label: 'IAMeTube' }
  ];

  const testFormInjection = async (method = 'form-injection') => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/module-access', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          module,
          method,
          debug: debugMode,
          credentials: customCredentials
        })
      });

      if (response.ok) {
        const html = await response.text();
        setResult(html);
        
        // Ouvrir dans un nouvel onglet pour voir le debug
        if (debugMode) {
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
          }
        }
      } else {
        const errorText = await response.text();
        setError(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (err) {
      setError(`Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAccess = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const moduleUrls = {
        stablediffusion: 'https://stablediffusion.regispailler.fr',
        iatube: 'https://iatube.regispailler.fr',
        iametube: 'https://iametube.regispailler.fr'
      };

      const response = await fetch(`/api/module-access?module=${module}&method=direct`, {
        method: 'GET'
      });

      if (response.ok) {
        const html = await response.text();
        setResult(html);
      } else {
        const errorText = await response.text();
        setError(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (err) {
      setError(`Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testBasicAuth = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch(`/api/module-access?module=${module}&method=basic-auth`, {
        method: 'GET'
      });

      if (response.ok) {
        const html = await response.text();
        setResult(html);
      } else {
        const errorText = await response.text();
        setError(`Erreur ${response.status}: ${errorText}`);
      }
    } catch (err) {
      setError(`Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const openInNewTab = () => {
    const moduleUrls = {
      stablediffusion: 'https://stablediffusion.regispailler.fr',
      iatube: 'https://iatube.regispailler.fr',
      iametube: 'https://iametube.regispailler.fr'
    };
    window.open(moduleUrls[module as keyof typeof moduleUrls], '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔐 Test Form Injection - Debug Avancé
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module à tester
                </label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {modules.map((mod) => (
                    <option key={mod.value} value={mod.value}>
                      {mod.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={customCredentials.username}
                  onChange={(e) => setCustomCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={customCredentials.password}
                  onChange={(e) => setCustomCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="debugMode"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="debugMode" className="ml-2 block text-sm text-gray-900">
                  Mode Debug (affiche les logs visuels)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Actions de test</h3>
              
              <button
                onClick={testFormInjection}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Test Form Injection...
                  </>
                ) : (
                  <>🔐 Test Form Injection</>
                )}
              </button>

              <button
                onClick={() => testFormInjection('gradio-injection')}
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Test Gradio Injection...
                  </>
                ) : (
                  <>🎯 Test Gradio Injection</>
                )}
              </button>

              <button
                onClick={() => testFormInjection('gradio-auth')}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Test Gradio Auth...
                  </>
                ) : (
                  <>🚀 Test Gradio Auth</>
                )}
              </button>

              <button
                onClick={() => testFormInjection('launch-args')}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Test Launch Args...
                  </>
                ) : (
                  <>⚙️ Test Launch Args</>
                )}
              </button>

              <button
                onClick={testDirectAccess}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Test Accès Direct...
                  </>
                ) : (
                  <>🌐 Test Accès Direct</>
                )}
              </button>

              <button
                onClick={testBasicAuth}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Test Basic Auth...
                  </>
                ) : (
                  <>🔑 Test Basic Auth</>
                )}
              </button>

              <button
                onClick={openInNewTab}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center"
              >
                📂 Ouvrir dans un nouvel onglet
              </button>
            </div>
          </div>

          {/* Informations */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ Instructions</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>Form Injection</strong> : Injecte du JavaScript pour remplir automatiquement les formulaires</li>
              <li>• <strong>Mode Debug</strong> : Affiche une fenêtre de debug en haut à droite de la page</li>
              <li>• <strong>Accès Direct</strong> : Teste l'accès direct à l'URL du module</li>
              <li>• <strong>Basic Auth</strong> : Teste l'authentification HTTP Basic</li>
              <li>• Ouvrez la console du navigateur pour voir les logs détaillés</li>
            </ul>
          </div>
        </div>

        {/* Résultats */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">❌ Erreur</h3>
            <pre className="text-red-800 text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Résultat</h3>
            <div className="bg-gray-100 rounded-md p-4 overflow-auto max-h-96">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{result}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 