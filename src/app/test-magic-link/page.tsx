'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function TestMagicLinkPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Vérification de la session
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setSessionChecked(true);
        console.log('🔍 Session vérifiée:', !!currentSession);
      } catch (error) {
        console.error('Erreur vérification session:', error);
        setSessionChecked(true);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Changement session:', event, !!session);
        setSession(session);
        setUser(session?.user || null);
        setSessionChecked(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const testMagicLinkGeneration = async () => {
    if (!user?.id) {
      setError('Vous devez être connecté pour tester');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

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

      const data = await response.json();
      
      if (data.success) {
        setResult({
          type: 'generation',
          data: data
        });
        console.log('✅ Magic link généré:', data);
      } else {
        setError(`Erreur génération: ${data.error}`);
        console.error('❌ Erreur génération magic link:', data.error);
      }
    } catch (error) {
      setError(`Erreur réseau: ${error}`);
      console.error('❌ Exception génération magic link:', error);
    } finally {
      setLoading(false);
    }
  };

  const testMagicLinkValidation = async () => {
    if (!result?.data?.magicLink) {
      setError('Générez d\'abord un magic link');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Extraire le token du magic link
      const url = new URL(result.data.magicLink);
      const token = url.searchParams.get('magic_link');
      
      if (!token) {
        setError('Token non trouvé dans le magic link');
        return;
      }

      const response = await fetch('/api/validate-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          type: 'validation',
          data: data
        });
        console.log('✅ Magic link validé:', data);
      } else {
        setError(`Erreur validation: ${data.error}`);
        console.error('❌ Erreur validation magic link:', data.error);
      }
    } catch (error) {
      setError(`Erreur réseau: ${error}`);
      console.error('❌ Exception validation magic link:', error);
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
            🔗 Test Magic Links
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🔗 Test Magic Links
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testMagicLinkGeneration}
              disabled={loading || !user?.id}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '⏳ Génération...' : '🔗 Générer Magic Link'}
            </button>
            
            <button
              onClick={testMagicLinkValidation}
              disabled={loading || !result?.data?.magicLink}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? '⏳ Validation...' : '✅ Valider Magic Link'}
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
                {result.type === 'generation' ? '🔗 Magic Link Généré' : '✅ Magic Link Validé'}
              </h3>
              <div className="space-y-2">
                {result.type === 'generation' && (
                  <>
                    <div><strong>Module :</strong> {result.data.moduleName}</div>
                    <div><strong>Expire dans :</strong> {result.data.expiresIn}</div>
                    <div><strong>Type de token :</strong> {result.data.tokenType}</div>
                    <div className="mt-2">
                      <strong>Magic Link :</strong>
                      <div className="bg-gray-100 p-2 rounded text-sm break-all mt-1">
                        {result.data.magicLink}
                      </div>
                    </div>
                  </>
                )}
                {result.type === 'validation' && (
                  <>
                    <div><strong>User ID :</strong> {result.data.magicLinkData.userId}</div>
                    <div><strong>Module :</strong> {result.data.magicLinkData.moduleName}</div>
                    <div><strong>Permissions :</strong> {result.data.magicLinkData.permissions.join(', ')}</div>
                    <div><strong>Expire le :</strong> {new Date(result.data.magicLinkData.expiresAt).toLocaleString('fr-FR')}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📖 Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Cliquez sur "Générer Magic Link" pour créer un lien d'accès sécurisé</li>
              <li>Cliquez sur "Valider Magic Link" pour tester la validation du lien généré</li>
              <li>Le magic link peut être utilisé pour accéder à l'application externe</li>
              <li>Les liens expirent automatiquement après 24 heures</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 