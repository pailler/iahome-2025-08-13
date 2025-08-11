'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';

function CancelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(8);

  // Récupérer les paramètres de l'URL
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Compte à rebours pour la redirection automatique
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleRedirect = (path: string) => {
    router.push(path);
  };

  const handleRetry = () => {
    // Retourner à la page précédente ou à l'accueil
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Animation d'annulation */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement annulé
          </h1>
          <p className="text-gray-600 mb-6">
            Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
          </p>
        </div>

        {/* Informations de la session */}
        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">ID de session</p>
            <p className="text-xs font-mono text-gray-700 break-all">{sessionId}</p>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Réessayer le paiement</span>
          </button>

          <button
            onClick={() => handleRedirect('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Retour à l'accueil</span>
          </button>
        </div>

        {/* Compte à rebours */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Redirection automatique vers l'accueil dans{' '}
            <span className="font-semibold text-red-600">{countdown}</span>{' '}
            seconde{countdown > 1 ? 's' : ''}
          </p>
        </div>

        {/* Message d'aide */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Besoin d'aide ?</strong>
          </p>
          <ul className="text-sm text-blue-600 mt-2 space-y-1">
            <li>• Vérifiez que votre carte est valide</li>
            <li>• Assurez-vous d'avoir suffisamment de fonds</li>
            <li>• Contactez-nous si le problème persiste</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <CancelPageContent />
    </Suspense>
  );
} 