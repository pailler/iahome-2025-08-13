'use client';
import { useState, useEffect } from 'react';

export default function TestExternalAppPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null);

  // URL de l'application principale
  const APP_PRINCIPALE_URL = 'https://home.regispailler.fr';

  useEffect(() => {
    const validateMagicLink = async () => {
      try {
        // Extraire le magic_link de l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('magic_link');
        
        if (!token) {
          console.log('❌ Aucun magic_link trouvé dans l\'URL');
          setLoading(false);
          return;
        }

        setMagicLinkToken(token);
        console.log('🔍 Magic link trouvé:', token.substring(0, 50) + '...');

        // Valider le magic link via l'API
        const response = await fetch(`${APP_PRINCIPALE_URL}/api/validate-magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        console.log('📡 Réponse API:', response.status, response.statusText);

        const data = await response.json();
        console.log('📄 Données reçues:', data);

        if (data.success) {
          // Authentification réussie
          setIsAuthenticated(true);
          setUserData(data.magicLinkData);
          
          // Stocker les données utilisateur
          localStorage.setItem('userData', JSON.stringify(data.magicLinkData));
          localStorage.setItem('isAuthenticated', 'true');
          
          // Nettoyer l'URL en supprimant le magic_link
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          console.log('✅ Utilisateur authentifié:', data.magicLinkData);
        } else {
          setError(data.error || 'Erreur de validation');
          console.error('❌ Erreur validation:', data.error);
        }
      } catch (error) {
        setError(`Erreur réseau: ${error}`);
        console.error('❌ Exception validation:', error);
      } finally {
        setLoading(false);
      }
    };

    // Vérifier si l'utilisateur est déjà authentifié
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUserData = localStorage.getItem('userData');
    
    if (storedAuth === 'true' && storedUserData) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(storedUserData));
      setLoading(false);
    } else {
      validateMagicLink();
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    window.location.reload();
  };

  const handleManualTest = async () => {
    if (!magicLinkToken) {
      setError('Générez d\'abord un magic link');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${APP_PRINCIPALE_URL}/api/validate-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: magicLinkToken }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setUserData(data.magicLinkData);
        localStorage.setItem('userData', JSON.stringify(data.magicLinkData));
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        setError(data.error || 'Erreur de validation');
      }
    } catch (error) {
      setError(`Erreur réseau: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validation du magic link...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                🎉 Application Externe - Connecté
              </h1>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Se déconnecter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Authentification Réussie</h2>
                <div className="space-y-2 text-sm">
                  <div><strong>User ID:</strong> {userData.userId}</div>
                  <div><strong>Module:</strong> {userData.moduleName}</div>
                  <div><strong>Permissions:</strong> {userData.permissions.join(', ')}</div>
                  <div><strong>Expire le:</strong> {new Date(userData.expiresAt).toLocaleString('fr-FR')}</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">🔧 Interface Simulée</h2>
                <p className="text-blue-700 mb-4">
                  Cette page simule une application externe qui a validé le magic link avec succès.
                </p>
                <div className="space-y-2">
                  <div className="bg-blue-100 p-2 rounded text-sm">
                    <strong>URL de test:</strong> {window.location.href}
                  </div>
                  <div className="bg-blue-100 p-2 rounded text-sm">
                    <strong>API appelée:</strong> {APP_PRINCIPALE_URL}/api/validate-magic-link
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Cette page simule une application externe (comme Metube)</li>
                <li>Le magic link a été validé avec succès</li>
                <li>L'utilisateur est maintenant authentifié</li>
                <li>Vous pouvez tester avec différents magic links</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🔐 Application Externe - Connexion Requise
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Erreur d'authentification</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">🔍 Diagnostic</h2>
              <div className="space-y-2 text-sm">
                <div><strong>URL actuelle:</strong> {window.location.href}</div>
                <div><strong>Magic link trouvé:</strong> {magicLinkToken ? 'Oui' : 'Non'}</div>
                <div><strong>API principale:</strong> {APP_PRINCIPALE_URL}</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">🧪 Test Manuel</h2>
              <p className="text-blue-700 mb-4">
                Si vous avez un magic link, vous pouvez le tester manuellement.
              </p>
              <button
                onClick={handleManualTest}
                disabled={!magicLinkToken}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Tester le Magic Link
              </button>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📖 Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Cette page simule une application externe (comme Metube)</li>
              <li>Accédez à cette page avec un magic link valide</li>
              <li>Exemple: <code>?magic_link=VOTRE_TOKEN</code></li>
              <li>Le magic link sera automatiquement validé</li>
              <li>Si valide, vous serez authentifié et verrez le contenu</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 