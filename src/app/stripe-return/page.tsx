'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import Header from '../../components/Header';

export default function StripeReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'canceled' | 'error' | null>(null);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    };

    getSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Vérifier les paramètres URL pour déterminer le statut
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');
    
    console.log('🔍 Stripe Return - Paramètres reçus:', { sessionId, canceled });
    
    if (sessionId) {
      setStatus('success');
      console.log('✅ Stripe Return - Paiement réussi détecté');
      
      // Rediriger automatiquement vers la page de validation après 2 secondes
      setTimeout(() => {
        router.push('/validation?success=true&session_id=' + sessionId);
      }, 2000);
      
    } else if (canceled) {
      setStatus('canceled');
      console.log('⚠️ Stripe Return - Paiement annulé détecté');
      
      // Rediriger automatiquement vers la page de validation après 2 secondes
      setTimeout(() => {
        router.push('/validation?canceled=true');
      }, 2000);
      
    } else {
      setStatus('error');
      console.log('❌ Stripe Return - Aucun paramètre de statut détecté');
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Traitement en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez être connecté pour voir cette page.</p>
            <Link href="/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          {/* Icône de statut */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full mb-8">
            {status === 'success' && (
              <div className="bg-green-100 h-24 w-24 rounded-full flex items-center justify-center">
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'canceled' && (
              <div className="bg-yellow-100 h-24 w-24 rounded-full flex items-center justify-center">
                <svg className="h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 h-24 w-24 rounded-full flex items-center justify-center">
                <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {status === 'success' && '🎉 Paiement réussi !'}
            {status === 'canceled' && '⚠️ Paiement annulé'}
            {status === 'error' && '❌ Erreur de paiement'}
          </h1>

          {/* Message de confirmation */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {status === 'success' && 'Votre paiement a été traité avec succès. Vous allez être redirigé vers la page de validation...'}
            {status === 'canceled' && 'Votre paiement a été annulé. Vous allez être redirigé vers la page de validation...'}
            {status === 'error' && 'Une erreur s\'est produite lors du traitement de votre paiement.'}
          </p>

          {/* Statut de l'activation */}
          {status === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8 max-w-2xl mx-auto">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Redirection automatique en cours...</span>
              </div>
              <p className="mt-2 text-sm">
                Vos modules seront activés automatiquement et vous pourrez y accéder depuis votre page "Mes Applications".
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {status === 'success' && (
              <Link 
                href="/validation?success=true" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Voir la confirmation
              </Link>
            )}
            
            <Link 
              href="/selections" 
              className="inline-flex items-center px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Retour aux sélections
            </Link>
          </div>

          {/* Informations techniques */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Cette page sert d'intermédiaire pour traiter le retour de Stripe.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Besoin d'aide ? Contactez-nous à{' '}
              <a href="mailto:support@iahome.fr" className="text-blue-600 hover:text-blue-700">
                support@iahome.fr
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
