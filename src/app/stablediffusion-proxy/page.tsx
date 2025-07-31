'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function StableDiffusionProxy() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProxyOption, setShowProxyOption] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier la session utilisateur
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setError('Vous devez être connecté pour accéder à Stable Diffusion');
          setLoading(false);
          return;
        }

        setUser(session.user);
        console.log('👤 Utilisateur connecté:', session.user.email);

        // Générer le JWT
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
          throw new Error('Erreur lors de la génération du token JWT');
        }

        const data = await response.json();
        console.log('🔐 JWT généré:', data.jwt ? 'Succès' : 'Échec');
        
        if (data.jwt) {
          setJwt(data.jwt);
          
          // Redirection directe vers Stable Diffusion avec le JWT
          const stableDiffusionUrl = `https://stablediffusion.regispailler.fr?jwt=${data.jwt}`;
          console.log('🔗 Redirection vers:', stableDiffusionUrl);
          
          // Redirection dans un nouvel onglet
          window.open(stableDiffusionUrl, '_blank');
          
          // Afficher les options après un délai
          setTimeout(() => {
            setShowProxyOption(true);
          }, 3000);
        } else {
          throw new Error('Token JWT non reçu');
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Erreur authentification:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const openWithProxy = () => {
    if (jwt) {
      const proxyUrl = `/api/proxy-stablediffusion?jwt=${jwt}&path=/`;
      window.open(proxyUrl, '_blank');
    }
  };

  const openDirect = () => {
    if (jwt) {
      const stableDiffusionUrl = `https://stablediffusion.regispailler.fr?jwt=${jwt}`;
      window.open(stableDiffusionUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Préparation de l'accès à Stable Diffusion...</p>
          <p className="text-sm text-gray-500 mt-2">Redirection automatique en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Erreur d'accès</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Accès autorisé !</h1>
        <p className="text-gray-600 mb-4">
          Stable Diffusion s'ouvre dans un nouvel onglet.
          <br />
          Si l'onglet ne s'est pas ouvert ou si vous avez des problèmes, essayez les options ci-dessous.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={openDirect}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            🔗 Ouvrir directement (recommandé)
          </button>
          
          <button
            onClick={openWithProxy}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full"
          >
            🔄 Ouvrir via proxy (si direct ne fonctionne pas)
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors w-full"
          >
            ← Retour à l'accueil
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Si Stable Diffusion demande encore un mot de passe, 
            cela signifie que l'application n'est pas encore configurée pour accepter les JWT.
            <br />
            Dans ce cas, utilisez : <code className="bg-blue-100 px-1 rounded">admin</code> / <code className="bg-blue-100 px-1 rounded">Rasulova75</code>
          </p>
        </div>

        {showProxyOption && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Conseil :</strong> Si l'ouverture directe ne fonctionne pas, 
              essayez l'option "via proxy" qui contourne les restrictions de navigateur.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 