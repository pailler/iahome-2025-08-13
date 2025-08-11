'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import StripeCheckout from '../../components/StripeCheckout';
import Link from 'next/link';
import Header from '../../components/Header';

function SelectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: boolean}>({});

  // Fonction pour obtenir l'URL d'accès d'un module
  const getModuleAccessUrl = (moduleName: string) => {
    const moduleUrls: { [key: string]: string } = {
      'Metube': '/api/proxy-metube',
      // Ajouter d'autres modules ici quand ils seront disponibles
      // 'IAphoto': 'https://iaphoto.regispailler.fr',
      // 'IAvideo': 'https://iavideo.regispailler.fr',
    };
    
    return moduleUrls[moduleName] || null;
  };

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
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
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setRole(data.role);
        });
    }
  }, [user]);

  // Vérifier les sélections actives de l'utilisateur
  useEffect(() => {
    const checkUserSubscriptions = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('module_access')
          .select(`
            module_id,
            expires_at,
            modules(title)
          `)
          .eq('user_id', user.id)
          .eq('access_type', 'active')
          .gt('expires_at', new Date().toISOString());
        
        if (!error && data) {
          const subscriptions: {[key: string]: boolean} = {};
          data.forEach(sub => {
            if (sub.modules && sub.modules.length > 0) {
              subscriptions[sub.modules[0].title] = true;
            }
          });
          setUserSubscriptions(subscriptions);
          console.log('✅ Sélections actives:', subscriptions);
        }
      } catch (error) {
        console.error('Erreur vérification sélections:', error);
      }
    };

    if (user) {
      checkUserSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    // Vérifier le statut du paiement depuis les paramètres URL
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success) {
      setPaymentStatus('success');
      // Vider les modules après un paiement réussi
      localStorage.removeItem('selectedModules');
      setModules([]);
    } else if (canceled) {
      setPaymentStatus('canceled');
    }
  }, [searchParams]);

  useEffect(() => {
    // Récupérer les modules sélectionnés depuis le localStorage
    const saved = localStorage.getItem('selectedModules');
    console.log('localStorage selectedModules:', saved);
    
    if (saved) {
      try {
        const selectedModules = JSON.parse(saved);
        console.log('Modules sélectionnés:', selectedModules);
        setModules(selectedModules);
      } catch (error) {
        console.error('Erreur parsing localStorage:', error);
        setModules([]);
      }
    } else {
      console.log('Aucun module dans localStorage');
      setModules([]);
    }
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-blue-50">
        <Header />
        <div className="py-12 pt-16">
          <div className="bg-white p-8 rounded shadow flex flex-col gap-4 w-full max-w-2xl mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="text-blue-900 font-bold">Visiteur</div>
                <div className="text-xs text-gray-600">Non connecté</div>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-900 font-medium px-4 py-2 rounded hover:bg-blue-100 border border-blue-200" onClick={() => router.push('/login')}>Se connecter</button>
                <button className="text-blue-900 font-medium px-4 py-2 rounded hover:bg-blue-100 border border-blue-200" onClick={() => router.push('/')}>Retour à l'accueil</button>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded shadow w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Mes sélections</h2>
            
            {/* Affichage du statut de paiement */}
            {paymentStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                ✅ Paiement réussi ! Vos sélections ont été confirmées.
              </div>
            )}
            
            {paymentStatus === 'canceled' && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                ⚠️ Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.
              </div>
            )}
            
            {modules.length === 0 ? (
              <div className="text-blue-900/70">Aucun module sélectionné pour le moment.</div>
            ) : (
              <>
                <ul className="space-y-4 mb-6">
                  {modules.map((module, idx) => (
                    <li key={idx} className="border border-blue-100 rounded-lg p-4 flex flex-col gap-1 bg-blue-50">
                      <div className="font-semibold text-blue-900">{module.title || 'Module sans titre'}</div>
                      {module.description && <div className="text-blue-900/80 text-sm" dangerouslySetInnerHTML={{ __html: module.description }} />}
                      {module.category && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded w-fit mb-1">{module.category.toUpperCase().replace('AI TOOLS', 'IA ASSISTANT').replace('MEDIA', 'IA ASSISTANT').replace('OUTILS', 'IA ASSISTANT').replace('TEMPLATES', 'IA ASSISTANT').replace('IA OUTILS', 'IA ASSISTANT').replace('MARKETING', 'IA MARKETING').replace('DESIGN', 'IA DESIGN')}</span>}
                      {module.price && <div className="text-blue-900 font-bold">Prix : {module.price} €</div>}
                      
                      {/* Bouton d'accès direct pour les modules avec abonnement actif */}
                      {userSubscriptions[module.title] && (
                        <div className="mt-2">
                          <button 
                            className="px-4 py-2 rounded-lg font-semibold text-sm bg-green-600 hover:bg-green-700 text-white transition-colors"
                            onClick={() => {
                                                                // Accès direct pour tous les modules
                                  {
                                                              // Accès direct pour les autres modules
                              const moduleUrls: { [key: string]: string } = {
                                'Metube': '/api/proxy-metube',
                                'IAphoto': 'https://iaphoto.regispailler.fr',
                                'IAvideo': 'https://iavideo.regispailler.fr',
                              };
                                
                                const directUrl = moduleUrls[module.title];
                                if (directUrl) {
                                  console.log('🔍 Accès direct vers:', directUrl);
                                  window.open(directUrl, '_blank');
                                }
                              }
                            }}
                            title={`Accéder à ${module.title}`}
                          >
                            📺 Accéder à {module.title}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                
                {/* Total des sélections */}
                <div className="border-t border-blue-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-blue-900">Total des sélections :</span>
                    <span className="text-2xl font-bold text-blue-900">
                      {modules.reduce((total, module) => total + (module.price || 0), 0)} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-blue-900/70 mb-4">
                    <span>{modules.length} sélection{modules.length > 1 ? 's' : ''}</span>
                    <span>Prix total</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      onClick={() => router.push('/login')}
                    >
                      Se connecter pour payer
                    </button>
                    <button
                      className="px-4 py-3 text-blue-900 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                      onClick={() => router.push('/')}
                    >
                      Continuer
                    </button>
                    <button
                      className="px-4 py-3 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        localStorage.removeItem('selectedModules');
                        setModules([]);
                        alert('Sélections vidées !');
                      }}
                    >
                      Vider mes sélections
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-blue-50">
      <Header />
      <div className="py-12">
        <div className="bg-white p-8 rounded shadow flex flex-col gap-4 w-full max-w-2xl mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">🛒 Gestion des Sélections</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/encours" 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📦 Voir mes applis actives
            </Link>
          </div>
        </div>
        <div className="bg-white p-8 rounded shadow w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Mes sélections</h2>
          {modules.length === 0 ? (
            <div className="text-blue-900/70">Aucun module sélectionné pour le moment.</div>
          ) : (
            <>
              <ul className="space-y-4 mb-6">
                {modules.map((module, idx) => (
                  <li key={idx} className="border border-blue-100 rounded-lg p-4 flex flex-col gap-1 bg-blue-50">
                    <div className="font-semibold text-blue-900">{module.title || 'Module sans titre'}</div>
                    {module.description && <div className="text-blue-900/80 text-sm" dangerouslySetInnerHTML={{ __html: module.description }} />}
                    {module.category && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded w-fit mb-1">{module.category.toUpperCase().replace('AI TOOLS', 'IA ASSISTANT').replace('MEDIA', 'IA ASSISTANT').replace('OUTILS', 'IA ASSISTANT').replace('TEMPLATES', 'IA ASSISTANT').replace('IA OUTILS', 'IA ASSISTANT').replace('MARKETING', 'IA MARKETING').replace('DESIGN', 'IA DESIGN')}</span>}
                    {module.price && <div className="text-blue-900 font-bold">Prix : {module.price} €</div>}
                    
                    {/* Bouton d'accès direct pour les modules avec abonnement actif */}
                    {userSubscriptions[module.title] && (
                      <div className="mt-2">
                        <button 
                          className="px-4 py-2 rounded-lg font-semibold text-sm bg-green-600 hover:bg-green-700 text-white transition-colors"
                          onClick={() => {
                            // Vérifier si c'est un module qui nécessite un magic link
                            if (module.title === 'iatube' || module.title.toLowerCase().includes('iatube')) {
                              // Pour iatube, on ne peut pas accéder directement depuis cette page
                              alert('Pour accéder à ' + module.title + ', veuillez retourner à la page principale et cliquer sur le bouton d\'accès.');
                              return;
                            } else {
                              // Accès direct pour les autres modules
                              const moduleUrls: { [key: string]: string } = {
                                'IAmetube': '/api/proxy-metube',
                                'IAphoto': 'https://iaphoto.regispailler.fr',
                                'IAvideo': 'https://iavideo.regispailler.fr',
                              };
                              
                              const directUrl = moduleUrls[module.title];
                              if (directUrl) {
                                console.log('🔍 Accès direct vers:', directUrl);
                                window.open(directUrl, '_blank');
                              }
                            }
                          }}
                          title={`Accéder à ${module.title}`}
                        >
                          📺 Accéder à {module.title}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              
              {/* Total des sélections */}
              <div className="border-t border-blue-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-blue-900">Total des sélections :</span>
                  <span className="text-2xl font-bold text-blue-900">
                    {modules.reduce((total, module) => total + (module.price || 0), 0)} €
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-blue-900/70 mb-4">
                  <span>{modules.length} sélection{modules.length > 1 ? 's' : ''}</span>
                  <span>Prix total</span>
                </div>
                <div className="flex gap-3">
                  {session ? (
                    <StripeCheckout
                      items={modules}
                      customerEmail={user?.email}
                      onSuccess={() => {
                        setPaymentStatus('success');
                        localStorage.removeItem('selectedModules');
                        setModules([]);
                      }}
                      onError={(error) => {
                        alert(`Erreur de paiement: ${error}`);
                      }}
                    />
                  ) : (
                    <button
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      onClick={() => router.push('/login')}
                    >
                      Se connecter pour payer
                    </button>
                  )}
                  <button
                    className="px-4 py-3 text-blue-900 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                    onClick={() => router.push('/')}
                  >
                    Continuer
                  </button>
                  <button
                    className="px-4 py-3 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      localStorage.removeItem('selectedModules');
                      setModules([]);
                      alert('Sélections vidées !');
                    }}
                  >
                    Vider mes sélections
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SelectionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-900">Chargement...</p>
        </div>
      </div>
    }>
      <SelectionsContent />
    </Suspense>
  );
} 