'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ✅ Paiement Réussi !
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Votre paiement a été traité avec succès. Un email de confirmation vous a été envoyé.
            </p>
          </div>

          {sessionId && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                <strong>ID Session :</strong> {sessionId}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Retour à l'accueil
            </Link>
            
            <Link 
              href="/test-payment"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors ml-4"
            >
              Tester les Emails
            </Link>
          </div>

          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📧 Email de Confirmation</h3>
            <p className="text-sm text-blue-700">
              Un email de confirmation a été envoyé à votre adresse email. 
              Vérifiez votre boîte de réception et le dossier spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 