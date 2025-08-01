'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Header from '../../components/Header';

export default function EncoursPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });

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

  // Récupérer le rôle de l'utilisateur (optionnel - table profiles non créée)
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        // Pour l'instant, on définit un rôle par défaut
        // La table profiles n'est pas encore créée
        setRole('user');
        console.log('✅ Rôle utilisateur défini par défaut');
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle:', error);
      }
    };

    if (user) {
      fetchUserRole();
    }
  }, [user]);

      // Charger les sélections actives
  useEffect(() => {
    const fetchActiveSubscriptions = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        console.log('🔍 Chargement des sélections pour utilisateur:', user.id);
        
        const { data, error } = await supabase
          .from('module_access')
          .select(`
            id,
            created_at,
            access_type,
            expires_at,
            metadata,
            cartes!inner(
              id,
              title,
              description,
              category,
              price
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Erreur chargement sélections:', error);
          console.error('Détails de l\'erreur:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          // Afficher l'erreur à l'utilisateur
          setActiveSubscriptions([]);
          setError(`Erreur de chargement: ${error.message}`);
        } else {
          setActiveSubscriptions(data || []);
          setError(null);
          console.log('✅ Sélections actives chargées:', data);
        }
      } catch (error) {
                  console.error('❌ Erreur exception chargement sélections:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchActiveSubscriptions();
    }
  }, [user]);

  // Rediriger si pas connecté
  useEffect(() => {
    if (sessionChecked && !session) {
      console.log('⚠️ Utilisateur non connecté, affichage de la page sans session');
    } else if (sessionChecked && session) {
      console.log('✅ Utilisateur connecté:', session.user.email);
    }
  }, [sessionChecked, session]);

  // Fonction pour générer un magic link pour un module
  const generateModuleMagicLink = async (moduleName: string) => {
    if (!session?.user?.id) return null;
    
    try {
      const response = await fetch('/api/generate-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          moduleName: moduleName,
          permissions: ['access']
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.magicLink;
      } else {
        console.error(`❌ Erreur génération magic link pour ${moduleName}:`, data.error);
        return null;
      }
    } catch (error) {
      console.error(`❌ Exception génération magic link pour ${moduleName}:`, error);
      return null;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour calculer les jours restants
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Fonction pour vérifier l'accès à un module
  const checkModuleAccess = async (moduleName: string) => {
    if (!session?.user?.id) return { canAccess: false, reason: 'Utilisateur non connecté' };
    
    try {
      const response = await fetch('/api/check-session-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          moduleName: moduleName
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur vérification accès:', error);
      return { canAccess: false, reason: 'Erreur de vérification' };
    }
  };

  // Fonction pour obtenir les conditions d'accès selon le module
  const getAccessConditions = (moduleTitle: string) => {
    return 'Accès illimité';
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center pt-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header />
        <header>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                  ← Retour à l'accueil
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">📦 Mes Abonnements en Cours</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connexion requise</h2>
            <p className="text-gray-600 mb-6">Vous devez être connecté pour voir vos sélections en cours.</p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/login" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Se connecter
              </Link>
              <Link 
                href="/" 
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              ← Retour à l'accueil
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">📦 Mes Abonnements en Cours</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/selections" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Gérer les sélections
            </Link>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos sélections...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
              <Link 
                href="/test-subscription" 
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Tester la connexion
              </Link>
            </div>
          </div>
        ) : activeSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucun abonnement actif</h2>
            <p className="text-gray-600 mb-6">Vous n'avez actuellement aucun abonnement en cours.</p>
            <Link 
              href="/" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Découvrir nos modules
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Résumé de vos sélections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{activeSubscriptions.length}</div>
                  <div className="text-sm text-gray-600">Sélections actives</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {activeSubscriptions.length}
                  </div>
                  <div className="text-sm text-gray-600">Modules accessibles</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {activeSubscriptions.filter(access => access.expires_at).length > 0 
                      ? Math.min(...activeSubscriptions
                          .filter(access => access.expires_at)
                          .map(access => getDaysRemaining(access.expires_at)))
                      : '∞'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Jours restants (min)</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSubscriptions.map((access) => {
                const module = access.cartes;
                const hasExpiration = access.expires_at;
                const daysRemaining = hasExpiration ? getDaysRemaining(access.expires_at) : null;
                
                return (
                  <div key={access.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        {hasExpiration ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            daysRemaining <= 7 
                              ? 'bg-red-100 text-red-700' 
                              : daysRemaining <= 30 
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                          }`}>
                            {daysRemaining} jours
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            Accès permanent
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Catégorie :</span> {module.category}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Prix :</span> €{module.price}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Acheté le :</span> {formatDate(access.created_at)}
                        </div>
                        {hasExpiration && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Expire le :</span> {formatDate(access.expires_at)}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Type d'accès :</span> 
                          <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {access.access_type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Conditions :</span> 
                          <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                            {getAccessConditions(module.title)}
                          </span>
                        </div>
                      </div>

                      <button 
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        onClick={async () => {
                          // Vérifier l'accès au module avant d'ouvrir
                          const accessCheck = await checkModuleAccess(module.title);
                          
                          if (!accessCheck.canAccess) {
                            if (accessCheck.reason === 'Session expirée') {
                              alert(`Session expirée pour ${module.title}. Veuillez générer un nouveau lien d'accès.`);
                            } else {
                              alert(`Accès refusé pour ${module.title}: ${accessCheck.reason}`);
                            }
                            return;
                          }

                            // Accès direct pour tous les modules dans une iframe
                            // Accès direct pour tous les autres modules dans une iframe
                            const moduleUrls: { [key: string]: string } = {
                              'IA metube': 'https://metube.regispailler.fr',
                              'IAmetube': 'https://metube.regispailler.fr',
                              'IAphoto': 'https://iaphoto.regispailler.fr',
                              'IAvideo': 'https://iavideo.regispailler.fr',
                              'Librespeed': 'https://librespeed.regispailler.fr',
                              'PSitransfer': 'https://psitransfer.regispailler.fr',
                              'PDF+': 'https://pdfplus.regispailler.fr',
                            };
                            
                            const directUrl = moduleUrls[module.title];
                            if (directUrl) {
                              console.log('🔍 Ouverture de', module.title, 'dans une iframe:', directUrl);
                              setIframeModal({
                                isOpen: true,
                                url: directUrl,
                                title: module.title
                              });
                            } else {
                              // Fallback : essayer un magic link
                              const magicLink = await generateModuleMagicLink(module.title);
                              if (magicLink) {
                                setIframeModal({
                                  isOpen: true,
                                  url: magicLink,
                                  title: module.title
                                });
                              } else {
                                alert('Erreur lors de la génération du lien d\'accès');
                              }
                            }
                        }}
                        title={`Accéder à ${module.title}`}
                      >
                                                                        {module.price === 0 ? '🆓 Accéder gratuitement' : '🔗 Accéder à ' + module.title}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modal pour l'iframe */}
      {iframeModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header de la modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {iframeModal.title}
              </h3>
              <button
                onClick={() => setIframeModal({isOpen: false, url: '', title: ''})}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenu de l'iframe */}
            <div className="flex-1 p-4">
              <iframe
                src={iframeModal.url}
                className="w-full h-full border-0 rounded"
                title={iframeModal.title}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 