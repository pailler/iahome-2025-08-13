'use client';

import { useState } from 'react';

export default function TestBypassAuth() {
  const [module, setModule] = useState('stablediffusion');
  const [method, setMethod] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const modules = [
    { value: 'stablediffusion', label: 'Stable Diffusion' },
    { value: 'iatube', label: 'IATube' },
    { value: 'iametube', label: 'IAMeTube' }
  ];

  const methods = [
    { value: 'auto', label: 'Automatique (toutes les méthodes)' },
    { value: 'basic-auth', label: 'Authentification Basic HTTP' },
    { value: 'direct-login', label: 'Connexion directe POST' },
    { value: 'form-injection', label: 'Injection de formulaire JavaScript' },
    { value: 'cookie-session', label: 'Gestion des cookies de session' }
  ];

  const testBypassAuth = async () => {
    setLoading(true);
    setError('');
    setResult('');
    setDiagnostics(null);

    try {
      const response = await fetch('/api/module-access', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module,
          method,
          action: 'bypass'
        }),
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const authMethod = response.headers.get('x-auth-method');
        
        if (contentType && contentType.includes('text/html')) {
          // C'est du HTML, on l'affiche dans une nouvelle fenêtre
          const html = await response.text();
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
            setResult(`✅ Page ouverte dans une nouvelle fenêtre avec authentification automatique (méthode: ${authMethod})`);
          } else {
            setResult(`✅ Authentification réussie - HTML reçu (méthode: ${authMethod})`);
          }
          
          // Analyser le contenu pour le diagnostic
          if (html.includes('Diagnostic d\'Authentification')) {
            setDiagnostics({
              type: 'diagnostic',
              message: 'Page de diagnostic affichée - échec de l\'authentification'
            });
          }
        } else {
          // C'est du JSON
          const data = await response.json();
          setResult(JSON.stringify(data, null, 2));
        }
      } else {
        const errorData = await response.json();
        setError(`Erreur ${response.status}: ${errorData.error || 'Erreur inconnue'}`);
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
      const response = await fetch(`/api/module-access?module=${module}`, {
        method: 'GET',
      });

      if (response.ok) {
        const html = await response.text();
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
          setResult('✅ Accès direct réussi - Page ouverte dans une nouvelle fenêtre');
        } else {
          setResult('✅ Accès direct réussi - HTML reçu');
        }
      } else {
        const errorData = await response.json();
        setError(`Erreur ${response.status}: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (err) {
      setError(`Erreur de connexion: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testNetworkConnectivity = async () => {
    setLoading(true);
    setError('');
    setResult('');

    const moduleUrls = {
      stablediffusion: 'https://stablediffusion.regispailler.fr',
      iatube: 'https://iatube.regispailler.fr',
      iametube: 'https://iametube.regispailler.fr'
    };

    const url = moduleUrls[module as keyof typeof moduleUrls];

    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'IAHome-Test/1.0'
        }
      });
      const endTime = Date.now();

      const result = {
        url,
        status: response.status,
        statusText: response.statusText,
        responseTime: endTime - startTime,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        accessible: response.ok
      };

      setResult(`🌐 Test de connectivité pour ${url}:\n` + JSON.stringify(result, null, 2));
    } catch (err) {
      setError(`Erreur de connectivité: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testBasicAuthDirect = async () => {
    setLoading(true);
    setError('');
    setResult('');

    const moduleUrls = {
      stablediffusion: 'https://stablediffusion.regispailler.fr',
      iatube: 'https://iatube.regispailler.fr',
      iametube: 'https://iametube.regispailler.fr'
    };

    const url = moduleUrls[module as keyof typeof moduleUrls];
    const credentials = Buffer.from('admin:Rasulova75').toString('base64');

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': 'IAHome-Test/1.0'
        }
      });

      const result: any = {
        url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        authenticated: response.ok
      };

      if (response.ok) {
        const content = await response.text();
        result.contentLength = content.length;
        
        if (content.includes('login') || content.includes('username') || content.includes('password')) {
          result.analysis = 'Page de connexion détectée';
        } else if (content.includes('dashboard') || content.includes('welcome') || content.includes('home')) {
          result.analysis = 'Page authentifiée détectée!';
        } else {
          result.analysis = 'Contenu neutre';
        }
      }

      setResult(`🔐 Test Basic Auth direct pour ${url}:\n` + JSON.stringify(result, null, 2));
    } catch (err) {
      setError(`Erreur Basic Auth: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔐 Test d'Outrepassement d'Identification
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                Méthode d'authentification
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {methods.map((meth) => (
                  <option key={meth.value} value={meth.value}>
                    {meth.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={testBypassAuth}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Test...
                </>
              ) : (
                <>
                  🔓 Test outrepassement
                </>
              )}
            </button>

            <button
              onClick={testDirectAccess}
              disabled={loading}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Test...
                </>
              ) : (
                <>
                  🌐 Test accès direct
                </>
              )}
            </button>

            <button
              onClick={testNetworkConnectivity}
              disabled={loading}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Test...
                </>
              ) : (
                <>
                  🌐 Test connectivité
                </>
              )}
            </button>

            <button
              onClick={testBasicAuthDirect}
              disabled={loading}
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Test...
                </>
              ) : (
                <>
                  🔐 Test Basic Auth
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-medium mb-2">❌ Erreur</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-green-800 font-medium mb-2">✅ Résultat</h3>
              <pre className="text-green-700 text-sm whitespace-pre-wrap overflow-x-auto">{result}</pre>
            </div>
          )}

          {diagnostics && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-yellow-800 font-medium mb-2">⚠️ Diagnostic</h3>
              <p className="text-yellow-700 text-sm">{diagnostics.message}</p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              📋 Informations sur les méthodes d'authentification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <strong>🔐 Basic Auth :</strong> Utilise l'authentification HTTP Basic avec les credentials dans les headers.
              </div>
              <div>
                <strong>💉 Form Injection :</strong> Injecte du JavaScript pour remplir automatiquement les formulaires de connexion.
              </div>
              <div>
                <strong>🍪 Cookie Session :</strong> Gère les cookies de session pour maintenir l'authentification.
              </div>
              <div>
                <strong>🤖 Auto :</strong> Essaie toutes les méthodes dans l'ordre jusqu'à ce qu'une fonctionne.
              </div>
              <div>
                <strong>📤 Direct Login :</strong> Tentative de connexion directe via requête POST.
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              🛠️ Commandes de test avancées
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Test complet :</strong> <code className="bg-blue-100 px-2 py-1 rounded">node test-bypass-auth-enhanced.js</code></p>
              <p><strong>Test Stable Diffusion :</strong> <code className="bg-blue-100 px-2 py-1 rounded">node test-bypass-auth-enhanced.js --stable-diffusion</code></p>
              <p><strong>Test connectivité :</strong> <code className="bg-blue-100 px-2 py-1 rounded">node test-bypass-auth-enhanced.js --network</code></p>
              <p><strong>Test module spécifique :</strong> <code className="bg-blue-100 px-2 py-1 rounded">node test-bypass-auth-enhanced.js --module stablediffusion</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 