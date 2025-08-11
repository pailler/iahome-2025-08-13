'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Home, List, Sparkles, Clock, Mail } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(8);
  const [hasActiveModules, setHasActiveModules] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les paramètres de l'URL
  const sessionId = searchParams.get('session_id');
  const moduleName = searchParams.get('module') || 'Module';

  useEffect(() => {
    // Vérifier si l'utilisateur a des modules actifs
    const checkActiveModules = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setHasActiveModules(false);
          return;
        }

        const response = await fetch(`/api/check-subscriptions?userId=${user.id}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setHasActiveModules(data.hasActiveSubscription || false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des modules:', error);
        setHasActiveModules(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkActiveModules();

    // Compte à rebours pour la redirection automatique
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Redirection intelligente
          if (hasActiveModules) {
            router.push('/encours');
          } else {
            router.push('/');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, hasActiveModules]);

  const handleRedirect = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de vos modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
        {/* Effet de particules décoratives */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-8 w-3 h-3 bg-green-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-8 left-8 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-1500"></div>
        </div>

        {/* Animation de succès */}
        <div className="mb-8 relative z-10">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              Paiement réussi !
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-500 ml-2" />
          </div>
          
          <p className="text-gray-600 text-lg mb-2">
            Votre module <span className="font-semibold text-blue-600">{moduleName}</span> a été activé avec succès.
          </p>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mt-6 border border-green-200">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Accès immédiat disponible</span>
            </div>
          </div>
        </div>

        {/* Informations de la session */}
        {sessionId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-2 flex items-center justify-center">
              <Mail className="w-4 h-4 mr-2" />
              ID de session
            </p>
            <p className="text-xs font-mono text-gray-700 break-all bg-white p-2 rounded border">
              {sessionId}
            </p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => handleRedirect('/encours')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
          >
            <List className="w-6 h-6" />
            <span className="text-lg">Voir mes modules</span>
            <ArrowRight className="w-6 h-6" />
          </button>

          <button
            onClick={() => handleRedirect('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <Home className="w-5 h-5" />
            <span>Retour à l'accueil</span>
          </button>
        </div>

        {/* Compte à rebours */}
        <div className="pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-700 font-medium mb-2">
              Redirection automatique dans{' '}
              <span className="font-bold text-blue-800 text-lg">{countdown}</span>{' '}
              seconde{countdown > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-blue-600">
              Vers{' '}
              <span className="font-semibold">
                {hasActiveModules ? 'vos modules' : 'l\'accueil'}
              </span>
            </p>
          </div>
        </div>

        {/* Message de confirmation */}
        <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Prochaines étapes
          </h3>
          <ul className="text-sm text-green-700 space-y-2">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Votre module est maintenant accessible dans votre espace personnel
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Vous recevrez un email de confirmation avec les détails d'accès
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Consultez vos modules pour plus de détails et fonctionnalités
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Merci pour votre confiance ! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
} 