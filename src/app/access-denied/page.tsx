'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import { Suspense } from 'react';

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const requestedPath = searchParams.get('requested_path');

  const getReasonMessage = () => {
    switch (reason) {
      case 'ip_restricted':
        return {
          title: 'Accès restreint par IP',
          message: 'Cette ressource n\'est accessible que depuis des adresses IP autorisées.',
          icon: '🔒'
        };
      case 'unauthorized':
        return {
          title: 'Accès non autorisé',
          message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.',
          icon: '🚫'
        };
      default:
        return {
          title: 'Accès refusé',
          message: 'Vous n\'êtes pas autorisé à accéder à cette ressource.',
          icon: '⚠️'
        };
    }
  };

  const reasonInfo = getReasonMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          {/* Icône */}
          <div className="text-8xl mb-8 animate-bounce">
            {reasonInfo.icon}
          </div>
          
          {/* Titre */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {reasonInfo.title}
          </h1>
          
          {/* Message */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {reasonInfo.message}
          </p>
          
          {/* Détails techniques (si applicable) */}
          {requestedPath && (
            <div className="bg-gray-100 rounded-lg p-4 mb-8 max-w-md mx-auto">
              <p className="text-sm text-gray-600">
                <strong>Ressource demandée :</strong>
              </p>
              <code className="text-xs text-gray-800 bg-gray-200 px-2 py-1 rounded">
                {requestedPath}
              </code>
            </div>
          )}
          
          {/* Actions */}
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              🏠 Retour à l'accueil
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.</p>
            </div>
          </div>
          
          {/* Informations de sécurité */}
          <div className="mt-12 p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔐 Informations de sécurité
            </h3>
            <div className="text-left space-y-2 text-sm text-gray-600">
              <p>• Cette restriction protège les ressources sensibles</p>
              <p>• Seules les adresses IP autorisées peuvent accéder directement</p>
              <p>• Pour un accès temporaire, contactez l'administrateur</p>
              <p>• Les tentatives d'accès sont enregistrées pour la sécurité</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <AccessDeniedContent />
    </Suspense>
  );
}

