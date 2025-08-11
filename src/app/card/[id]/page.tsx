'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '../../../components/Breadcrumb';

interface Card {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  price: number | string;
  youtube_url?: string;
  image_url?: string;
  features?: string[];
  requirements?: string[];
  installation_steps?: string[];
  usage_examples?: string[];
  documentation_url?: string;
  github_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: any}>({});
  const [isSelected, setIsSelected] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [iframeModal, setIframeModal] = useState<{isOpen: boolean, url: string, title: string}>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Fonction pour accéder aux modules avec JWT
  const accessModuleWithJWT = async (moduleTitle: string, moduleId: string) => {
    if (!session) {
      alert('Vous devez être connecté pour accéder à ce module');
      return;
    }

    try {
      // Gestion spéciale pour RuinedFooocus avec tokens Gradio
      if (moduleTitle.toLowerCase() === 'ruinedfooocus') {
        console.log('🔑 Génération du token Gradio pour RuinedFooocus');
        
        const response = await fetch('/api/generate-gradio-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            moduleId: moduleId,
            moduleTitle: moduleTitle
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
        }
        
        const { token: gradioToken, expiresAt } = await response.json();
        console.log('✅ Token Gradio généré avec succès');
        
        // Construire l'URL sécurisée avec le token
        const secureUrl = `/api/gradio-secure?token=${gradioToken}`;
        console.log('🔗 URL d\'accès Gradio sécurisée:', secureUrl);
        
        setIframeModal({
          isOpen: true,
          url: secureUrl,
          title: moduleTitle
        });
        return;
      }

      // Gestion spéciale pour les adresses locales
      if (moduleTitle.toLowerCase().includes('local') || moduleTitle.toLowerCase().includes('192.168')) {
        console.log('🔑 Génération du token local pour:', moduleTitle);
        
        // Déterminer l'URL locale basée sur le titre du module
        let targetUrl = 'http://192.168.1.150:7870'; // URL par défaut
        
        if (moduleTitle.toLowerCase().includes('192.168.1.150')) {
          targetUrl = 'http://192.168.1.150:7870';
        } else if (moduleTitle.toLowerCase().includes('192.168.1.100')) {
          targetUrl = 'http://192.168.1.100:8080';
        } else if (moduleTitle.toLowerCase().includes('192.168.1.200')) {
          targetUrl = 'http://192.168.1.200:3000';
        }
        
        const response = await fetch('/api/generate-local-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            targetUrl: targetUrl,
            moduleTitle: moduleTitle,
            moduleId: moduleId
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
        }
        
        const { token: localToken, expiresAt } = await response.json();
        console.log('✅ Token local généré avec succès');
        
        // Construire l'URL sécurisée avec le token
        const secureUrl = `/api/local-proxy?token=${localToken}`;
        console.log('🔗 URL d\'accès local sécurisée:', secureUrl);
        
        setIframeModal({
          isOpen: true,
          url: secureUrl,
          title: moduleTitle
        });
        return;
      }

      // Pour les autres modules, utiliser le système JWT existant
      console.log('🔍 Génération du token JWT pour:', moduleTitle);
      
      const expirationHours = moduleTitle.toLowerCase() === 'ruinedfooocus' ? 12 : undefined;
      
      const response = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          moduleId: moduleId,
          moduleName: moduleTitle.toLowerCase().replace(/\s+/g, ''),
          expirationHours: expirationHours
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }
      
      const { accessToken, moduleName } = await response.json();
      console.log('✅ Token JWT généré avec succès');
      
      const moduleUrls: { [key: string]: string } = {
        'stablediffusion': 'https://stablediffusion.regispailler.fr',
        'iaphoto': 'https://iaphoto.regispailler.fr', 
        'metube': '/api/proxy-metube',
        'ia metube': '/api/proxy-metube',
        'chatgpt': 'https://chatgpt.regispailler.fr',
        'librespeed': '/api/proxy-librespeed',
        'psitransfer': 'https://psitransfer.regispailler.fr',
        'pdf+': 'https://pdfplus.regispailler.fr',
        'aiassistant': 'https://aiassistant.regispailler.fr',
        'cogstudio': 'https://cogstudio.regispailler.fr',
        'ruinedfooocus': '/api/gradio-secure',
        'invoke': 'https://invoke.regispailler.fr'
      };
      // Normaliser le nom de module pour l'indexation
      const normalizedName = (moduleName || '').toLowerCase().replace(/\s+/g, '');
      let baseUrl = moduleUrls[normalizedName];
      if (!baseUrl) {
        // Essayer à partir du titre de la carte si présent
        const titleKey = (moduleTitle || '').toLowerCase().replace(/\s+/g, '');
        baseUrl = moduleUrls[titleKey];
      }
      // Dernier recours: si c'est Librespeed, forcer le proxy local
      if (!baseUrl && ((moduleName || '').toLowerCase().includes('librespeed') || (moduleTitle || '').toLowerCase().includes('librespeed'))) {
        baseUrl = '/api/proxy-librespeed';
      }
      // Fallback par défaut si rien trouvé
      if (!baseUrl) {
        baseUrl = '/api/proxy-metube';
      }
      // Pour les modules proxy internes, ne pas ajouter le token dans l'URL
      const isProxyModule = baseUrl.startsWith('/api/');
      const accessUrl = isProxyModule ? baseUrl : `${baseUrl}?token=${accessToken}`;
      console.log('🔗 URL d\'accès:', accessUrl);
      
      setIframeModal({
        isOpen: true,
        url: accessUrl,
        title: moduleTitle
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès:', error);
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Vérifier la session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Récupérer les abonnements de l'utilisateur
  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      if (!session?.user?.id) {
        setUserSubscriptions({});
        return;
      }

      try {
        const { data: accessData, error: accessError } = await supabase
          .from('module_access')
          .select('id, created_at, access_type, expires_at, metadata, module_id')
          .eq('user_id', session.user.id);

        if (accessError) {
          console.error('❌ Erreur chargement accès:', accessError);
          return;
        }

        const subscriptions: {[key: string]: any} = {};
        
        for (const access of accessData || []) {
          try {
            const { data: moduleData, error: moduleError } = await supabase
              .from('modules')
              .select('id, title, price, category')
              .eq('id', access.module_id)
              .single();

            if (moduleError) {
              console.error(`❌ Erreur chargement module ${access.module_id}:`, moduleError);
              continue;
            }

            if (moduleData) {
              subscriptions[moduleData.title] = {
                ...moduleData,
                access: access
              };
            }
          } catch (error) {
            console.error(`❌ Exception chargement module ${access.module_id}:`, error);
            continue;
          }
        }

        setUserSubscriptions(subscriptions);
      } catch (error) {
        console.error('❌ Erreur chargement abonnements:', error);
      }
    };

    fetchUserSubscriptions();
  }, [session?.user?.id]);

  // Charger les modules sélectionnés depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedCards');
    if (saved) {
      try {
        setSelectedCards(JSON.parse(saved));
      } catch {
        setSelectedCards([]);
      }
    }
  }, []);

  // Charger les détails de la carte
  useEffect(() => {
    const fetchCardDetails = async () => {
      if (!params.id) return;

      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Erreur lors du chargement de la carte:', error);
          router.push('/');
          return;
        }

        if (data) {
          setCard(data);
          // Debug info
          console.log('🔍 Debug card:', data.title, 'price:', data.price, 'price type:', typeof data.price, 'session:', !!session);
        }
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [params.id, router, session]);

  const handleSubscribe = (card: Card) => {
    const isSelected = selectedCards.some(c => c.id === card.id);
    let newSelectedCards;
    
    if (isSelected) {
      newSelectedCards = selectedCards.filter(c => c.id !== card.id);
      console.log('Désabonnement de:', card.title);
    } else {
      newSelectedCards = [...selectedCards, card];
      console.log('Abonnement à:', card.title);
    }
    
    console.log('Nouveaux modules sélectionnés:', newSelectedCards);
    setSelectedCards(newSelectedCards);
    localStorage.setItem('selectedCards', JSON.stringify(newSelectedCards));
    console.log('localStorage mis à jour');
  };

  const isCardSelected = (cardId: string) => {
    return selectedCards.some(card => card.id === cardId);
  };

  const handleChoose = () => {
    setIsSelected(true);
  };

  const handleActivate = async () => {
    if (!user?.email) {
      alert('Veuillez vous connecter pour activer ce module');
      return;
    }

    if (!card) {
      alert('Module non trouvé');
      return;
    }

    setIsActivating(true);
    setIsProcessing(true);

    try {
      // Créer l'intention de paiement
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: card.id,
            title: card.title,
            description: card.description,
            price: typeof card.price === 'string' ? parseFloat(card.price) : card.price
          }],
          customerEmail: user.email,
          type: 'payment'
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const { url: sessionUrl } = await response.json();

      // Rediriger vers Stripe Checkout
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        throw new Error('URL de session Stripe manquante');
      }

    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
      alert('Erreur lors de l\'activation du module. Veuillez réessayer.');
    } finally {
      setIsActivating(false);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setIsSelected(false);
    setIsActivating(false);
    setIsProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Carte non trouvée</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: card?.title || 'Chargement...' }
            ]}
          />
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* En-tête de la carte */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="mb-8">
                  <div className="flex-1">
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-bold rounded-full mb-6 shadow-lg">
                      {card.category?.toUpperCase() || 'IA ASSISTANT'}
                    </span>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2 leading-tight">
                      {card.title}
                    </h1>
                    {card.subtitle && (
                      <p className="text-xl text-gray-500 italic mb-6 leading-relaxed max-w-2xl">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vidéo YouTube - Temporairement désactivée pour éviter les erreurs YouTubeJS */}
                <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🎥</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Démonstration vidéo</h3>
                    <p className="text-gray-500">Vidéo temporairement indisponible</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Carte d'action */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="text-left mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                    <div className="text-4xl font-bold mb-1">€{card.price}</div>
                    <div className="text-sm opacity-90">par mois</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Boutons d'action */}
                  {(card.price === 0 || card.price === '0') && session ? (
                    // Bouton d'accès gratuit pour les modules gratuits (uniquement si connecté)
                    <>
                      <button 
                        className="w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        onClick={async () => {
                          if (!session) {
                            alert('Connectez-vous pour accéder à ce module');
                            return;
                          }

                          // Utiliser l'accès JWT pour tous les modules gratuits (sécurisé)
                          console.log('🔍 Ouverture du module gratuit', card.title, 'avec token JWT');
                          await accessModuleWithJWT(card.title, card.id);
                        }}
                      >
                        <span className="text-xl">🆓</span>
                        <span>Accéder gratuitement</span>
                      </button>
                      
                                                 {/* Lien direct vers Gradio pour RuinedFooocus gratuit */}
                           {card.title.toLowerCase() === 'ruinedfooocus' && (
                             <>
                               <a 
                                 href="https://da4be546aab3e23055.gradio.live/"
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                 title="Accéder directement à l'application RuinedFooocus sur Gradio"
                               >
                                 <span className="text-xl">🚀</span>
                                 <span>Accès direct Gradio</span>
                               </a>
                               
                               {/* Bouton d'accès local pour RuinedFooocus */}
                               <button 
                                 className="w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                 onClick={async () => {
                                   if (!session) {
                                     alert('Connectez-vous pour accéder à cette ressource locale');
                                     return;
                                   }
                                   
                                   console.log('🔑 Accès local RuinedFooocus demandé');
                                   
                                   try {
                                     const response = await fetch('/api/generate-local-token', {
                                       method: 'POST',
                                       headers: {
                                         'Content-Type': 'application/json',
                                         'Authorization': `Bearer ${session?.access_token}`
                                       },
                                       body: JSON.stringify({
                                         targetUrl: 'http://192.168.1.150:7870',
                                         moduleTitle: 'RuinedFooocus Local',
                                         moduleId: card.id
                                       }),
                                     });
                                     
                                     if (!response.ok) {
                                       const errorData = await response.json();
                                       throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
                                     }
                                     
                                     const { token: localToken } = await response.json();
                                     console.log('✅ Token local généré avec succès');
                                     
                                     // Construire l'URL sécurisée avec le token
                                     const secureUrl = `/api/local-proxy?token=${localToken}`;
                                     console.log('🔗 URL d\'accès local sécurisée:', secureUrl);
                                     
                                     setIframeModal({
                                       isOpen: true,
                                       url: secureUrl,
                                       title: 'RuinedFooocus Local'
                                     });
                                   } catch (error) {
                                     console.error('❌ Erreur lors de l\'accès local:', error);
                                     alert(`Erreur lors de l'accès local: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                                   }
                                 }}
                                 title="Accéder à l'application RuinedFooocus locale (192.168.1.150:7870)"
                               >
                                 <span className="text-xl">🏠</span>
                                 <span>Accès Local (192.168.1.150)</span>
                               </button>
                             </>
                           )}
                    </>
                  ) : (card.price === 0 || card.price === '0') && !session ? (
                    // Message pour les modules gratuits quand l'utilisateur n'est pas connecté
                    <div className="text-left p-4 bg-gray-100 rounded-lg">
                      <p className="text-gray-600 mb-2">Module gratuit</p>
                      <p className="text-sm text-gray-500">Connectez-vous pour accéder à ce module</p>
                    </div>
                  ) : (
                    // Boutons pour les modules payants
                    <div className="space-y-4">
                      {!['PSitransfer', 'PDF+', 'Librespeed'].includes(card.title) && (
                        <>
                          {!isSelected ? (
                            <button 
                              className="w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                              onClick={handleChoose}
                            >
                              <span className="text-xl">🔐</span>
                              <span>Choisir</span>
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <button 
                                className="w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                onClick={handleActivate}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <span className="text-xl animate-spin">⏳</span>
                                ) : (
                                  <span className="text-xl">⚡</span>
                                )}
                                <span>
                                  {isProcessing ? 'Traitement...' : `Activer ${card.title}`}
                                </span>
                              </button>
                              
                              <button 
                                className="w-full font-semibold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                onClick={handleCancel}
                                disabled={isProcessing}
                              >
                                <span>Annuler</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {/* Bouton dupliqué supprimé - le bouton est déjà dans la section des modules gratuits */}
                    </div>
                  )}

                  {/* Bouton d'accès - visible seulement si l'utilisateur a déjà payé pour le module */}
                  {session && userSubscriptions[card.title] && (
                    <button 
                      className="w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      onClick={async () => {
                        await accessModuleWithJWT(card.title, card.id);
                      }}
                    >
                      <span className="text-xl">🔑</span>
                      <span>Accéder à {card.title}</span>
                    </button>
                  )}

                  {!session && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-600">
                        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                          Connectez-vous
                        </Link> {card.price === 0 ? 'pour accéder' : 'pour utiliser le module'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Liens utiles */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">Liens utiles</h3>
                <div className="space-y-4">
                  {card.documentation_url && (
                    <a 
                      href={card.documentation_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 text-gray-700 hover:text-blue-600 transition-all duration-200 p-3 rounded-xl hover:bg-blue-50 group"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                      <span className="font-medium">Documentation</span>
                    </a>
                  )}
                  
                  {card.github_url && (
                    <a 
                      href={card.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 text-gray-700 hover:text-blue-600 transition-all duration-200 p-3 rounded-xl hover:bg-blue-50 group"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                      </div>
                      <span className="font-medium">Code source</span>
                    </a>
                  )}
                  
                  {card.demo_url && (
                    <a 
                      href={card.demo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-4 text-gray-700 hover:text-blue-600 transition-all duration-200 p-3 rounded-xl hover:bg-blue-50 group"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                      </div>
                      <span className="font-medium">Démo en ligne</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Prérequis */}
              {card.requirements && card.requirements.length > 0 && (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">Prérequis</h3>
                  <div className="space-y-4">
                    {card.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-700 font-medium">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Zones de contenu en pleine largeur avec design moderne */}
      
      {/* Fonctionnalités - Pleine largeur */}
      {card.features && card.features.length > 0 && (
        <div className="bg-gradient-to-br from-white to-blue-50/50 border-t border-gray-200/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-left mb-16">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                Fonctionnalités principales
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez toutes les fonctionnalités avancées de {card.title}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {card.features.map((feature, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-semibold text-lg">{feature}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exemples d'utilisation - Pleine largeur */}
      {card.usage_examples && card.usage_examples.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-left mb-16">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                Exemples d'utilisation
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Voyez comment {card.title} peut transformer votre workflow
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {card.usage_examples.map((example, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      Exemple {index + 1}
                    </h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">{example}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Étapes d'installation - Pleine largeur */}
      {card.installation_steps && card.installation_steps.length > 0 && (
        <div className="bg-gradient-to-br from-white to-blue-50/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-left mb-16">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                Installation
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Guide d'installation simple et rapide
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="space-y-8">
                {card.installation_steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold text-2xl">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                        Étape {index + 1}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-xl">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone de détails du module - Pleine largeur */}
      <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 border-t border-gray-200/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-left mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              {card.subtitle || card.title}
            </h2>
            <div 
              className="text-xl text-gray-600 max-w-4xl mx-auto"
              dangerouslySetInnerHTML={{ __html: card.description }}
            />
          </div>
          

          {/* Avantages clés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">🚀</span>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">Performance</h4>
              <p className="text-gray-700 leading-relaxed">
                Optimisé pour des performances maximales avec une interface utilisateur intuitive et réactive.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">🔒</span>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-4">Sécurité</h4>
              <p className="text-gray-700 leading-relaxed">
                Sécurité de niveau entreprise avec authentification robuste et protection des données.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">🛠️</span>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent mb-4">Flexibilité</h4>
              <p className="text-gray-700 leading-relaxed">
                Architecture modulaire permettant une personnalisation complète selon vos besoins.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">📈</span>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent mb-4">Évolutivité</h4>
              <p className="text-gray-700 leading-relaxed">
                Évolue avec votre entreprise, de la startup à l'entreprise multinationale.
              </p>
            </div>
          </div>

          {/* Informations techniques */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-12">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-8 text-center">
              Informations techniques
            </h3>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <div className="text-sm text-gray-600 mb-2 font-medium">Catégorie</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {card.category || 'IA ASSISTANT'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                  <div className="text-sm text-gray-600 mb-2 font-medium">Prix</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    €{card.price}/mois
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                  <div className="text-sm text-gray-600 mb-2 font-medium">Type</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    SaaS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              {(() => {
                const isLocalProxy = iframeModal.url.startsWith('/api/');
                const isLibreSpeedProxy = iframeModal.url.startsWith('/api/proxy-librespeed');
                const isMetubeProxy = iframeModal.url.startsWith('/api/proxy-metube');
                const sandbox = isLibreSpeedProxy
                  ? 'allow-scripts allow-forms allow-same-origin'
                  : isMetubeProxy
                    ? 'allow-scripts allow-forms allow-same-origin'
                    : isLocalProxy
                      ? 'allow-scripts allow-forms'
                      : 'allow-scripts allow-forms allow-popups allow-modals allow-same-origin';
                return (
                  <iframe
                    src={iframeModal.url}
                    className="w-full h-full border-0 rounded"
                    title={iframeModal.title}
                    allowFullScreen
                    sandbox={sandbox}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 