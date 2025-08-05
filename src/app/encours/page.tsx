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
  const [refreshing, setRefreshing] = useState(false);
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
        
        // D'abord, récupérer les accès modules
        const { data: accessData, error: accessError } = await supabase
          .from('module_access')
          .select(`
            id,
            created_at,
            access_type,
            expires_at,
            metadata,
            module_id
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (accessError) {
          console.error('❌ Erreur chargement accès modules:', accessError);
          setActiveSubscriptions([]);
          setError(`Erreur de chargement: ${accessError.message}`);
          return;
        }

        // Ensuite, récupérer les détails des modules et les tokens pour chaque accès
        const modulesWithDetails = [];
        for (const access of accessData || []) {
          try {
            // Récupérer les détails du module
            const { data: moduleData, error: moduleError } = await supabase
              .from('modules')
              .select('id, title, description, category, price')
              .eq('id', access.module_id)
              .single();

            if (moduleError) {
              console.error(`❌ Erreur chargement module ${access.module_id}:`, moduleError);
              // Ajouter un module par défaut pour éviter les erreurs d'affichage
              modulesWithDetails.push({
                ...access,
                modules: {
                  id: access.module_id,
                  title: 'Module supprimé',
                  description: 'Ce module n\'existe plus dans la base de données',
                  category: 'INCONNU',
                  price: '0'
                },
                token: null
              });
              continue;
            }

            // Récupérer les informations du token d'accès pour ce module
            let tokenInfo = null;
            try {
              const { data: tokenData, error: tokenError } = await supabase
                .from('access_tokens')
                .select(`
                  id,
                  name,
                  max_usage,
                  current_usage,
                  expires_at,
                  last_used_at,
                  is_active
                `)
                .eq('module_id', access.module_id)
                .eq('created_by', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              if (!tokenError && tokenData) {
                tokenInfo = tokenData;
                console.log(`✅ Token trouvé pour ${moduleData.title}:`, tokenInfo);
              } else {
                console.log(`ℹ️ Aucun token trouvé pour ${moduleData.title}`);
              }
            } catch (tokenError) {
              console.log(`ℹ️ Erreur lors de la récupération du token pour ${moduleData.title}:`, tokenError);
            }

            if (moduleData) {
              modulesWithDetails.push({
                ...access,
                modules: moduleData,
                token: tokenInfo
              });
            }
          } catch (error) {
            console.error(`❌ Exception lors du chargement du module ${access.module_id}:`, error);
            // Ajouter un module par défaut en cas d'exception
            modulesWithDetails.push({
              ...access,
              modules: {
                id: access.module_id,
                title: 'Module supprimé',
                description: 'Ce module n\'existe plus dans la base de données',
                category: 'INCONNU',
                price: '0'
              },
              token: null
            });
          }
        }

        setActiveSubscriptions(modulesWithDetails);
        setError(null);
        console.log('✅ Sélections actives chargées avec tokens:', modulesWithDetails);
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
      const response = await fetch('https://home.regispailler.fr/api/generate-magic-link', {
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

  // Fonction pour accéder aux modules avec JWT (comme dans la page du module)
  const accessModuleWithJWT = async (moduleTitle: string, moduleId: string) => {
    if (!session) {
      alert('Vous devez être connecté pour accéder à ce module');
      return;
    }

    try {
      console.log('🔍 Recherche d\'un token existant pour:', moduleTitle);
      
      // 1. D'abord, chercher un token existant et valide
      const { data: existingToken, error: tokenError } = await supabase
        .from('access_tokens')
        .select(`
          id,
          name,
          jwt_token,
          current_usage,
          max_usage,
          expires_at,
          is_active
        `)
        .eq('module_id', moduleId)
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let accessToken;
      let shouldIncrementUsage = false;

      if (!tokenError && existingToken) {
        // Vérifier si le token n'est pas expiré
        if (new Date(existingToken.expires_at) > new Date()) {
          console.log('✅ Token existant trouvé et valide');
          accessToken = existingToken.jwt_token;
          shouldIncrementUsage = true;
          
          // Incrémenter l'usage du token existant
          await supabase
            .from('access_tokens')
            .update({
              current_usage: existingToken.current_usage + 1,
              last_used_at: new Date().toISOString()
            })
            .eq('id', existingToken.id);
          
          console.log(`✅ Usage incrémenté: ${existingToken.current_usage + 1}/${existingToken.max_usage}`);
        } else {
          console.log('⚠️ Token existant expiré, génération d\'un nouveau token');
        }
      }

      // 2. Si pas de token valide, en générer un nouveau
      if (!accessToken) {
        console.log('🔄 Génération d\'un nouveau token JWT pour:', moduleTitle);
        
        // Définir la durée d'expiration spécifique pour certains modules
        const expirationHours = moduleTitle.toLowerCase() === 'ruinedfooocus' ? 12 : undefined;
        
        const response = await fetch('https://home.regispailler.fr/api/generate-access-token', {
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
        
        const { accessToken: newToken, moduleName } = await response.json();
        accessToken = newToken;
        console.log('✅ Nouveau token JWT généré avec succès');
      }
      
      console.log('🔍 Token (premiers caractères):', accessToken.substring(0, 50) + '...');
      
      const moduleUrls: { [key: string]: string } = {
        'stablediffusion': 'https://stablediffusion.regispailler.fr',
        'iaphoto': 'https://iaphoto.regispailler.fr', 
        'iametube': 'https://metube.regispailler.fr',
        'chatgpt': 'https://chatgpt.regispailler.fr',
        'librespeed': 'https://librespeed.regispailler.fr',
        'psitransfer': 'https://psitransfer.regispailler.fr',
        'pdf+': 'https://pdfplus.regispailler.fr',
        'aiassistant': 'https://aiassistant.regispailler.fr',
        'cogstudio': 'https://cogstudio.regispailler.fr',
        'ruinedfooocus': 'https://ruinedfooocus.regispailler.fr',
        'invoke': 'https://invoke.regispailler.fr'
      };
      
      // Déterminer le nom du module pour l'URL
      const moduleName = moduleTitle.toLowerCase().replace(/\s+/g, '');
      const baseUrl = moduleUrls[moduleName] || 'https://stablediffusion.regispailler.fr';
      const accessUrl = `${baseUrl}?token=${accessToken}`;
      console.log('🔗 URL d\'accès:', accessUrl);
      
      // Ouvrir dans une iframe au lieu d'un nouvel onglet
      setIframeModal({
        isOpen: true,
        url: accessUrl,
        title: moduleTitle
      });
      
      // Rafraîchir les données des tokens après l'accès
      setTimeout(() => {
        refreshTokenData();
      }, 2000); // Attendre 2 secondes pour laisser le temps à l'API de traiter
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès:', error);
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Fonction pour rafraîchir les données des tokens
  const refreshTokenData = async () => {
    if (!user?.id) return;
    
    try {
      setRefreshing(true);
      console.log('🔄 Rafraîchissement des données des tokens...');
      
      // Mettre à jour les données des tokens pour chaque module
      const updatedSubscriptions = await Promise.all(
        activeSubscriptions.map(async (access) => {
          try {
            // Récupérer les informations mises à jour du token
            const { data: tokenData, error: tokenError } = await supabase
              .from('access_tokens')
              .select(`
                id,
                name,
                max_usage,
                current_usage,
                expires_at,
                last_used_at,
                is_active
              `)
              .eq('module_id', access.module_id)
              .eq('created_by', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (!tokenError && tokenData) {
              console.log(`✅ Token mis à jour pour ${access.modules.title}:`, tokenData);
              return {
                ...access,
                token: tokenData
              };
            } else {
              console.log(`ℹ️ Aucun token trouvé pour ${access.modules.title}`);
              return {
                ...access,
                token: null
              };
            }
          } catch (error) {
            console.error(`❌ Erreur mise à jour token pour ${access.modules.title}:`, error);
            return access;
          }
        })
      );

      setActiveSubscriptions(updatedSubscriptions);
      console.log('✅ Données des tokens rafraîchies');
    } catch (error) {
      console.error('❌ Erreur rafraîchissement tokens:', error);
    } finally {
      setRefreshing(false);
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

  // Fonction pour formater la durée restante de manière détaillée
  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    
    if (diffTime <= 0) {
      return 'Expiré';
    }
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours}h` : ''}`;
    } else if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    } else {
      return `${minutes}min`;
    }
  };

  // Fonction pour obtenir la couleur selon le temps restant
  const getTimeRemainingColor = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    if (diffTime <= 0) {
      return 'bg-red-100 text-red-700';
    } else if (diffHours <= 1) {
      return 'bg-red-100 text-red-700';
    } else if (diffHours <= 6) {
      return 'bg-orange-100 text-orange-700';
    } else if (diffHours <= 24) {
      return 'bg-yellow-100 text-yellow-700';
    } else if (diffHours <= 168) { // 7 jours
      return 'bg-blue-100 text-blue-700';
    } else {
      return 'bg-green-100 text-green-700';
    }
  };

  // Fonction pour obtenir la couleur selon le pourcentage d'utilisation
  const getUsageColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    
    if (percentage >= 90) {
      return 'bg-red-100 text-red-700';
    } else if (percentage >= 75) {
      return 'bg-orange-100 text-orange-700';
    } else if (percentage >= 50) {
      return 'bg-yellow-100 text-yellow-700';
    } else {
      return 'bg-green-100 text-green-700';
    }
  };

  // Fonction pour vérifier l'accès à un module
  const checkModuleAccess = async (moduleName: string) => {
    if (!session?.user?.id) return { canAccess: false, reason: 'Utilisateur non connecté' };
    
    try {
      const response = await fetch('https://home.regispailler.fr/api/check-session-access', {
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
    if (moduleTitle === 'IA metube' || moduleTitle === 'IAmetube') {
      return '12 heures';
    }
    return null; // Pas de conditions pour les modules gratuits
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center pt-12">
              <div className="text-left">
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
                <h1 className="text-2xl font-bold text-gray-900">📦 Mes Abonnements en Cours</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-left py-12">
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
            <h1 className="text-2xl font-bold text-gray-900">📦 Mes Abonnements en Cours</h1>
          </div>

        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-left py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos sélections...</p>
          </div>
        ) : error ? (
          <div className="text-left py-12">
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
          <div className="text-left py-12">
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  📊 Résumé de vos sélections
                </h2>
                <button
                  onClick={refreshTokenData}
                  disabled={refreshing}
                  className={`px-3 py-1 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm ${
                    refreshing 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  title="Rafraîchir les données des tokens"
                >
                  <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
                </button>
              </div>
              
              {/* Alerte pour les modules expirés */}
              {activeSubscriptions.filter(access => {
                if (!access.expires_at) return false;
                const end = new Date(access.expires_at);
                const now = new Date();
                return end.getTime() <= now.getTime();
              }).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-red-600 mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">
                        Modules expirés
                      </h3>
                      <p className="text-sm text-red-700 mt-1">
                        {activeSubscriptions.filter(access => {
                          if (!access.expires_at) return false;
                          const end = new Date(access.expires_at);
                          const now = new Date();
                          return end.getTime() <= now.getTime();
                        }).map(access => access.modules.title).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerte pour les modules qui expirent bientôt */}
              {activeSubscriptions.filter(access => {
                if (!access.expires_at) return false;
                const end = new Date(access.expires_at);
                const now = new Date();
                const diffHours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
                return diffHours <= 24 && diffHours > 0;
              }).length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-yellow-600 mr-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">
                        Modules qui expirent bientôt
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        {activeSubscriptions.filter(access => {
                          if (!access.expires_at) return false;
                          const end = new Date(access.expires_at);
                          const now = new Date();
                          const diffHours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
                          return diffHours <= 24 && diffHours > 0;
                        }).map(access => access.modules.title).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}


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
                      ? (() => {
                          const expiringModules = activeSubscriptions.filter(access => access.expires_at);
                          const minTimeRemaining = Math.min(...expiringModules.map(access => {
                            const end = new Date(access.expires_at);
                            const now = new Date();
                            return end.getTime() - now.getTime();
                          }));
                          if (minTimeRemaining <= 0) return 'Expiré';
                          const days = Math.floor(minTimeRemaining / (1000 * 60 * 60 * 24));
                          const hours = Math.floor((minTimeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                          if (days > 0) return `${days}j`;
                          if (hours > 0) return `${hours}h`;
                          return '1h';
                        })()
                      : activeSubscriptions.filter(access => !access.expires_at).length > 0 
                        ? '∞'
                        : '0'
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    {activeSubscriptions.filter(access => access.expires_at).length > 0 
                      ? 'Temps restant (min)'
                      : activeSubscriptions.filter(access => !access.expires_at).length > 0
                        ? 'Modules permanents'
                        : 'Aucun module'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSubscriptions.map((access) => {
                const module = access.modules;
                const hasExpiration = access.expires_at;
                const daysRemaining = hasExpiration ? getDaysRemaining(access.expires_at) : null;
                
                return (
                  <div key={access.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                    hasExpiration && new Date(access.expires_at) <= new Date() 
                      ? 'border-red-300 bg-red-50' 
                      : hasExpiration && (new Date(access.expires_at).getTime() - new Date().getTime()) <= 24 * 60 * 60 * 1000
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200'
                  }`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {module.title}
                        </h3>
                        {hasExpiration && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTimeRemainingColor(access.expires_at)}`}>
                            {formatTimeRemaining(access.expires_at)}
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
                        {hasExpiration && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Temps restant :</span> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${getTimeRemainingColor(access.expires_at)}`}>
                              {formatTimeRemaining(access.expires_at)}
                            </span>
                          </div>
                        )}

                        {/* Informations du token d'accès */}
                        {access.token && (
                          <>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Token :</span> 
                              <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                                access.token.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {access.token.is_active ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                            
                            {access.token.max_usage && (
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">Utilisations :</span> 
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getUsageColor(access.token.current_usage || 0, access.token.max_usage)}`}>
                                    {access.token.current_usage || 0} / {access.token.max_usage}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      getUsageColor(access.token.current_usage || 0, access.token.max_usage).includes('red') ? 'bg-red-500' :
                                      getUsageColor(access.token.current_usage || 0, access.token.max_usage).includes('orange') ? 'bg-orange-500' :
                                      getUsageColor(access.token.current_usage || 0, access.token.max_usage).includes('yellow') ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(((access.token.current_usage || 0) / access.token.max_usage) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {access.token.expires_at && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Expire le :</span> 
                                <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${getTimeRemainingColor(access.token.expires_at)}`}>
                                  {formatDate(access.token.expires_at)}
                                </span>
                              </div>
                            )}
                            
                            {access.token.last_used_at && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Dernière utilisation :</span> 
                                <span className="ml-1 text-xs text-gray-500">
                                  {formatDate(access.token.last_used_at)}
                                </span>
                              </div>
                            )}
                          </>
                        )}

                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Type d'accès :</span> 
                          <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {access.access_type}
                          </span>
                        </div>
                        {getAccessConditions(module.title) && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Conditions :</span> 
                            <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                              {getAccessConditions(module.title)}
                            </span>
                          </div>
                        )}
                      </div>

                      <button 
                        className={`w-full px-4 py-2 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                          hasExpiration && new Date(access.expires_at) <= new Date()
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                        }`}
                        onClick={async () => {
                          if (hasExpiration && new Date(access.expires_at) <= new Date()) {
                            return; // Module expiré, pas d'action
                          }
                          // Utiliser la fonction JWT qui fonctionne
                          await accessModuleWithJWT(module.title, module.id);
                        }}
                        title={hasExpiration && new Date(access.expires_at) <= new Date() 
                          ? 'Module expiré' 
                          : `Accéder à ${module.title} avec JWT`
                        }
                        disabled={hasExpiration && new Date(access.expires_at) <= new Date()}
                      >
                        <span className="text-xl mr-2">
                          {hasExpiration && new Date(access.expires_at) <= new Date() ? '⏰' : '🔑'}
                        </span>
                        {hasExpiration && new Date(access.expires_at) <= new Date() 
                          ? 'Module expiré' 
                          : (module.price === '0' ? 'Accéder gratuitement' : 'Accéder à ' + module.title)
                        }
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