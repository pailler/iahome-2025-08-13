'use client';
import { useEffect, useState } from "react";
import { validateAccessToken, hasPermission } from "../../../utils/accessToken";
import { useParams, useSearchParams } from "next/navigation";

export default function AccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Récupérer le token depuis les paramètres de query
  const token = searchParams.get('token') || params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessData, setAccessData] = useState<any>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('🔍 [PAGE] Début validation token:', token);
        console.log('🔍 [PAGE] Params token:', params.token);
        console.log('🔍 [PAGE] Search params token:', searchParams.get('token'));
        setLoading(true);
        
        if (!token) {
          console.log('❌ [PAGE] Token manquant');
          setError('Token d\'accès manquant');
          return;
        }

        console.log('🔍 [PAGE] Appel validateAccessToken...');
        
        const tokenData = await validateAccessToken(token);
        
        console.log('🔍 [PAGE] Résultat validateAccessToken:', tokenData);
        
        if (!tokenData) {
          console.log('❌ [PAGE] Token invalide ou expiré');
          setError('Token d\'accès invalide ou expiré');
          return;
        }

        console.log('🔍 [PAGE] Vérification permissions...');
        
        // Vérifier les permissions si nécessaire
        if (!hasPermission(tokenData, 'access')) {
          console.log('❌ [PAGE] Permissions insuffisantes');
          setError('Permissions insuffisantes');
          return;
        }

        console.log('✅ [PAGE] Accès validé avec succès!');
        setAccessData(tokenData);
        console.log('✅ Accès validé pour:', tokenData);

        // Pas de redirection automatique pour éviter les boucles
        // L'utilisateur cliquera sur le bouton pour accéder au module

      } catch (error) {
        console.error('❌ [PAGE] Erreur validation token:', error);
        setError('Erreur lors de la validation du token');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, params.token, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validation de l'accès...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (accessData) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Accès autorisé</h2>
          <p className="text-gray-600 mb-4">
            Module: {accessData.moduleName}
          </p>
          <div className="animate-pulse mb-6">
            <div className="text-sm text-gray-500">
              Expire le: {accessData.expiresAt.toLocaleString('fr-FR')}
            </div>
          </div>
          
          {/* Bouton de redirection manuelle */}
          <button
            onClick={() => {
              const moduleUrls: { [key: string]: string } = {
                'IAmetube': 'https://metube.regispailler.fr',
                'IAphoto': 'https://iaphoto.regispailler.fr',
                'IAvideo': 'https://iavideo.regispailler.fr',
                'test-module': 'https://test.example.com',
                'Google': 'https://www.google.com',
                'iatube': 'https://metube.regispailler.fr',
              };

              const targetUrl = moduleUrls[accessData.moduleName];
              if (targetUrl) {
                console.log('🔍 [PAGE] Redirection manuelle vers:', targetUrl);
                window.location.href = `${targetUrl}?token=${token}`;
              }
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🚀 Accéder à {accessData.moduleName}
          </button>
        </div>
      </div>
    );
  }

  return null;
} 