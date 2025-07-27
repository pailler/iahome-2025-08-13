'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function TestMagicLinkDebugPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugSteps, setDebugSteps] = useState<string[]>([]);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Vérification de la session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setSessionChecked(true);
        addDebugStep('✅ Session vérifiée: ' + (currentSession ? 'Connecté' : 'Non connecté'));
      } catch (error) {
        console.error('Erreur vérification session:', error);
        setSessionChecked(true);
        addDebugStep('❌ Erreur vérification session: ' + error);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setSessionChecked(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const addDebugStep = (step: string) => {
    setDebugSteps(prev => [...prev, `${new Date().toLocaleTimeString()}: ${step}`]);
  };

  const clearDebugSteps = () => {
    setDebugSteps([]);
    setGeneratedToken(null);
    setValidationResult(null);
  };

  const testGenerateMagicLink = async () => {
    if (!user?.id) {
      addDebugStep('❌ Pas d\'utilisateur connecté');
      return;
    }

    setLoading(true);
    addDebugStep('🔍 Début test génération magic link...');

    try {
      const response = await fetch('/api/generate-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          moduleName: 'IAmetube',
          permissions: ['access']
        }),
      });

      addDebugStep(`📡 Réponse API: ${response.status} ${response.statusText}`);

      const data = await response.json();
      addDebugStep('📄 Données reçues: ' + JSON.stringify(data, null, 2));

      if (data.success) {
        setGeneratedToken(data.magicLink);
        addDebugStep('✅ Magic link généré avec succès');
        
        // Extraire le token de l'URL
        const url = new URL(data.magicLink);
        const token = url.searchParams.get('magic_link');
        if (token) {
          addDebugStep('🔑 Token extrait: ' + token.substring(0, 50) + '...');
        }
      } else {
        addDebugStep('❌ Erreur génération: ' + data.error);
      }
    } catch (error) {
      addDebugStep('❌ Exception génération: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const testValidateMagicLink = async () => {
    if (!generatedToken) {
      addDebugStep('❌ Pas de token généré à valider');
      return;
    }

    setLoading(true);
    addDebugStep('🔍 Début test validation magic link...');

    try {
      // Extraire le token du magic link
      const url = new URL(generatedToken);
      const token = url.searchParams.get('magic_link');
      
      if (!token) {
        addDebugStep('❌ Token non trouvé dans l\'URL');
        return;
      }

      addDebugStep('🔑 Token à valider: ' + token.substring(0, 50) + '...');

      const response = await fetch('/api/validate-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      addDebugStep(`📡 Réponse validation: ${response.status} ${response.statusText}`);

      const data = await response.json();
      addDebugStep('📄 Données validation: ' + JSON.stringify(data, null, 2));

      if (data.success) {
        setValidationResult(data);
        addDebugStep('✅ Magic link validé avec succès');
      } else {
        addDebugStep('❌ Erreur validation: ' + data.error);
      }
    } catch (error) {
      addDebugStep('❌ Exception validation: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const testExternalAppValidation = async () => {
    if (!generatedToken) {
      addDebugStep('❌ Pas de token généré à tester');
      return;
    }

    setLoading(true);
    addDebugStep('🔍 Test validation côté application externe...');

    try {
      // Extraire le token du magic link
      const url = new URL(generatedToken);
      const token = url.searchParams.get('magic_link');
      
      if (!token) {
        addDebugStep('❌ Token non trouvé dans l\'URL');
        return;
      }

      // Simuler la validation côté application externe
      const response = await fetch('/api/validate-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      addDebugStep(`📡 Réponse externe: ${response.status} ${response.statusText}`);

      const data = await response.json();
      addDebugStep('📄 Données externe: ' + JSON.stringify(data, null, 2));

      if (data.success) {
        addDebugStep('✅ Validation externe réussie');
      } else {
        addDebugStep('❌ Erreur validation externe: ' + data.error);
      }
    } catch (error) {
      addDebugStep('❌ Exception validation externe: ' + error);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            🔍 Debug Magic Links
          </h1>
          <div className="text-center text-gray-600">
            <p>Vous devez être connecté pour tester les magic links.</p>
            <a 
              href="/login" 
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🔍 Debug Magic Links
          </h1>

          {/* Informations de session */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">📋 Informations de session</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Connecté :</strong> {session ? '✅ Oui' : '❌ Non'}
              </div>
              <div>
                <strong>Email :</strong> {user?.email || 'Non disponible'}
              </div>
              <div>
                <strong>User ID :</strong> {user?.id || 'Non disponible'}
              </div>
              <div>
                <strong>Session vérifiée :</strong> {sessionChecked ? '✅ Oui' : '⏳ En cours'}
              </div>
            </div>
          </div>

          {/* Boutons de test */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testGenerateMagicLink}
              disabled={loading || !user?.id}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '⏳ Génération...' : '🔗 Générer Magic Link'}
            </button>
            
            <button
              onClick={testValidateMagicLink}
              disabled={loading || !generatedToken}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '⏳ Validation...' : '✅ Valider Magic Link'}
            </button>

            <button
              onClick={testExternalAppValidation}
              disabled={loading || !generatedToken}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '⏳ Test externe...' : '🌐 Test Application Externe'}
            </button>
          </div>

          <button
            onClick={clearDebugSteps}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 mb-6"
          >
            🗑️ Effacer les logs
          </button>

          {/* Résultats */}
          {generatedToken && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🔗 Magic Link Généré</h3>
              <div className="space-y-2">
                <div><strong>URL complète :</strong></div>
                <div className="bg-gray-100 p-2 rounded text-sm break-all">
                  {generatedToken}
                </div>
              </div>
            </div>
          )}

          {validationResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">✅ Validation Réussie</h3>
              <div className="space-y-2">
                <div><strong>User ID :</strong> {validationResult.magicLinkData.userId}</div>
                <div><strong>Module :</strong> {validationResult.magicLinkData.moduleName}</div>
                <div><strong>Permissions :</strong> {validationResult.magicLinkData.permissions.join(', ')}</div>
                <div><strong>Expire le :</strong> {new Date(validationResult.magicLinkData.expiresAt).toLocaleString('fr-FR')}</div>
              </div>
            </div>
          )}

          {/* Logs de debug */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 Logs de Debug</h3>
            <div className="bg-black text-green-400 p-4 rounded text-sm font-mono max-h-96 overflow-y-auto">
              {debugSteps.length === 0 ? (
                <div className="text-gray-500">Aucun log pour le moment...</div>
              ) : (
                debugSteps.map((step, index) => (
                  <div key={index} className="mb-1">
                    {step}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 