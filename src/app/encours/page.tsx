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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [activeTokens, setActiveTokens] = useState<any[]>([]);
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

  // Récupérer le rôle de l'utilisateur
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
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

  // Charger les tokens d'accès actifs
  useEffect(() => {
    const fetchActiveTokens = async () => {
      if (!user?.id) {
        console.log('⚠️ Pas d\'utilisateur connecté');
        return;
      }
      
      try {
        setLoading(true);
        console.log('🔍 Début du chargement pour utilisateur:', user.id);
        console.log('🔍 Email utilisateur:', user.email);
        
        // Test 1: Vérifier la connexion Supabase
        console.log('🔍 Test connexion Supabase...');
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('❌ Erreur connexion Supabase:', testError);
          setError(`Erreur connexion: ${testError.message}`);
          return;
        }
        console.log('✅ Connexion Supabase OK');
        
        // Test 2: Vérifier que l'utilisateur existe dans profiles
        console.log('🔍 Recherche du profil utilisateur...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', user.email)
          .single();
          
        if (profileError) {
          console.error('❌ Erreur récupération profil:', profileError);
          console.error('❌ Détails profil:', JSON.stringify(profileError, null, 2));
          setActiveTokens([]);
          setError(`Erreur profil: ${profileError.message}`);
          return;
        }
        
        console.log('✅ Profil utilisateur trouvé:', profileData);
        setUserProfile(profileData);
        
        // Test 3: Vérifier que la table module_access existe
        console.log('🔍 Test table module_access...');
        const { data: tableTest, error: tableError } = await supabase
          .from('module_access')
          .select('id')
          .limit(1);
        
        if (tableError) {
          console.error('❌ Erreur table module_access:', tableError);
          console.error('❌ Détails table:', JSON.stringify(tableError, null, 2));
          setActiveTokens([]);
          setError(`Table module_access non accessible: ${tableError.message}`);
          return;
        }
        console.log('✅ Table module_access accessible');
        
        // Test 4: Récupérer les accès modules actifs
        console.log('🔍 Récupération des accès modules...');
        const { data: accessData, error: accessError } = await supabase
          .from('module_access')
          .select(`
            id,
            user_id,
            module_id,
            access_type,
            expires_at,
            is_active,
            created_at,
            metadata
          `)
          .eq('user_id', profileData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (accessError) {
          console.error('❌ Erreur chargement accès modules:', accessError);
          console.error('❌ Détails accès:', JSON.stringify(accessError, null, 2));
          setActiveTokens([]);
          setError(`Erreur de chargement: ${accessError.message || 'Erreur inconnue'}`);
          return;
        }

        console.log('✅ Accès modules chargés:', accessData?.length || 0);
        console.log('🔍 Détails des accès:', accessData?.map(a => ({ 
          id: a.id, 
          module_id: a.module_id, 
          access_type: a.access_type, 
          created_at: a.created_at,
          expires_at: a.expires_at
        })));
        
        // Filtrer les accès actifs (non expirés)
        const activeAccessData = accessData ? accessData.filter(access => {
          if (!access.expires_at) return true; // Accès permanent
          const isNotExpired = new Date(access.expires_at) > new Date();
          return isNotExpired;
        }) : [];
        
        console.log('✅ Accès actifs après filtrage:', activeAccessData.length);
        console.log('🔍 Accès actifs:', activeAccessData?.map(a => ({ 
          id: a.id, 
          module_id: a.module_id, 
          access_type: a.access_type, 
          expires_at: a.expires_at
        })));
        
        // Transformer les données pour correspondre au format attendu
        const transformedTokens = activeAccessData.map(access => ({
          id: access.id,
          name: `Accès Module ${access.module_id}`,
          description: `Accès ${access.access_type} pour le module ${access.module_id}`,
          module_id: access.module_id,
          module_name: `Module ${access.module_id}`,
          access_level: 'premium',
          permissions: ['access'],
          max_usage: null,
          current_usage: 0,
          is_active: access.is_active,
          created_by: access.user_id,
          created_at: access.created_at,
          expires_at: access.expires_at,
          jwt_token: null,
          last_used_at: null,
          usage_log: [],
          modules: null,
          access_type: access.access_type,
          metadata: access.metadata
        }));
        
        console.log('✅ Accès modules transformés:', transformedTokens.length);
        
        // Récupérer les tokens de formateur_tic@hotmail.com
        console.log('🔍 Récupération des tokens de formateur_tic@hotmail.com...');
        try {
          const response = await fetch('/api/get-user-tokens', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: 'formateur_tic@hotmail.com'
            })
          });

          if (response.ok) {
            const { tokens: formateurTokens } = await response.json();
            console.log('✅ Tokens de formateur_tic récupérés:', formateurTokens?.length || 0);
            
            // Combiner les tokens de l'utilisateur connecté avec ceux de formateur_tic
            const allTokens = [...transformedTokens, ...(formateurTokens || [])];
            console.log('✅ Total des tokens combinés:', allTokens.length);
            
            setActiveTokens(allTokens);
          } else {
            console.log('⚠️ Erreur récupération tokens formateur_tic, utilisation des tokens utilisateur uniquement');
            setActiveTokens(transformedTokens);
          }
        } catch (formateurError) {
          console.log('⚠️ Erreur lors de la récupération des tokens formateur_tic:', formateurError);
          setActiveTokens(transformedTokens);
        }
        
        setError(null);
        console.log('✅ Chargement terminé avec succès');
      } catch (error) {
        console.error('❌ Erreur générale lors du chargement:', error);
        if (error instanceof Error) {
          console.error('❌ Stack trace:', error.stack);
          setError(`Erreur générale: ${error.message}`);
        } else {
          setError(`Erreur générale: ${String(error)}`);
        }
        setActiveTokens([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && sessionChecked) {
      fetchActiveTokens();
    }
  }, [user, sessionChecked]);

  const generateModuleMagicLink = async (moduleName: string) => {
    try {
      const response = await fetch('/api/generate-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          moduleName,
          userEmail: user.email
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const { magicLink } = await response.json();
      window.open(magicLink, '_blank');
    } catch (error) {
      console.error('Erreur génération magic link:', error);
      alert('Erreur lors de la génération du lien magique');
    }
  };

  const accessModuleWithJWT = async (moduleTitle: string, moduleId: string) => {
    try {
      console.log('🔑 Accès module avec JWT:', moduleTitle);
      
      const response = await fetch('/api/generate-module-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          moduleId,
          moduleTitle
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const { token, expiresAt, accessUrl, reused, currentUsage, maxUsage } = await response.json();
      
      if (reused) {
        console.log('✅ Token existant réutilisé');
      } else {
        console.log('✅ Nouveau token généré avec succès');
      }

      // Ouvrir dans une iframe sécurisée
      setIframeModal({
        isOpen: true,
        url: accessUrl,
        title: moduleTitle
      });

      // Mettre à jour immédiatement l'interface si on a les nouvelles données
      if (reused && typeof currentUsage === 'number' && typeof maxUsage === 'number') {
        console.log(`🔄 Mise à jour immédiate: ${currentUsage}/${maxUsage}`);
        setActiveTokens(prev => prev.map(sub => {
          if (sub.module_id === moduleId) {
            return {
              ...sub,
              token: {
                ...sub.token,
                current_usage: currentUsage,
                max_usage: maxUsage,
                last_used_at: new Date().toISOString()
              }
            };
          }
          return sub;
        }));
      }

      // Mettre à jour les données du token après un délai
      setTimeout(() => {
        console.log('🔄 Mise à jour automatique des données après accès...');
        refreshTokenData();
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur lors de l\'accès:', error);
      alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const refreshTokenData = async () => {
    if (!userProfile?.id) {
      console.error('❌ Pas de profil utilisateur pour actualiser');
      return;
    }
    
    try {
      setRefreshing(true);
      console.log('🔄 Actualisation des données...');
      
      // Recharger les données d'accès aux modules de l'utilisateur connecté
      const { data: accessData, error: accessError } = await supabase
        .from('module_access')
        .select(`
          id,
          user_id,
          created_at,
          access_type,
          expires_at,
          is_active,
          module_id
        `)
        .eq('user_id', userProfile?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (accessError) {
        console.error('❌ Erreur actualisation accès:', accessError);
        return;
      }

      // Recharger aussi les tokens de formateur_tic@hotmail.com
      try {
        const response = await fetch('/api/get-user-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: 'formateur_tic@hotmail.com'
          })
        });

        if (response.ok) {
          const { tokens: formateurTokens } = await response.json();
          console.log('✅ Tokens de formateur_tic actualisés:', formateurTokens?.length || 0);
          
          // Transformer les données d'accès de l'utilisateur connecté
          const transformedTokens = (accessData || []).map(access => ({
            id: access.id,
            name: `Accès Module ${access.module_id}`,
            description: `Accès ${access.access_type} pour le module ${access.module_id}`,
            module_id: access.module_id,
            module_name: `Module ${access.module_id}`,
            access_level: 'premium',
            permissions: ['access'],
            max_usage: null,
            current_usage: 0,
            is_active: access.is_active,
            created_by: access.user_id,
            created_at: access.created_at,
            expires_at: access.expires_at,
            jwt_token: null,
            last_used_at: null,
            usage_log: [],
            modules: null,
            access_type: access.access_type,
            metadata: {}
          }));
          
          // Combiner les tokens
          const allTokens = [...transformedTokens, ...(formateurTokens || [])];
          setActiveTokens(allTokens);
          console.log('✅ Total des tokens après actualisation:', allTokens.length);
        }
      } catch (formateurError) {
        console.log('⚠️ Erreur lors de l\'actualisation des tokens formateur_tic:', formateurError);
      }

      console.log('✅ Actualisation terminée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'Expiré';
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeRemainingColor = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'bg-red-100 text-red-700';
    if (diffTime <= 24 * 60 * 60 * 1000) return 'bg-yellow-100 text-yellow-700';
    if (diffTime <= 7 * 24 * 60 * 60 * 1000) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  const getUsageColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'bg-red-100 text-red-700';
    if (percentage >= 75) return 'bg-orange-100 text-orange-700';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const checkModuleAccess = async (moduleName: string) => {
    try {
      const response = await fetch('/api/check-module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ moduleName })
      });

      if (!response.ok) return false;
      const { hasAccess } = await response.json();
      return hasAccess;
    } catch (error) {
      console.error('Erreur vérification accès:', error);
      return false;
    }
  };

  const getAccessConditions = (moduleTitle: string) => {
    const conditions: { [key: string]: string } = {
      'ruinedfooocus': 'Accès sécurisé requis',
      'stable-diffusion': 'Token d\'authentification nécessaire'
    };
    return conditions[moduleTitle.toLowerCase()] || null;
  };

  // Afficher la page de connexion si pas connecté
  if (sessionChecked && !session) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header />
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">📦 Mes Abonnements en Cours</h1>
              </div>
            </div>
          </div>
        </header>

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
            </div>
          </div>
        ) : activeTokens.length === 0 ? (
          <div className="space-y-6">
            {/* Section résumé toujours visible */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  📊 Mes Applis
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Sélections actives</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Modules accessibles</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">-</div>
                  <div className="text-sm text-gray-600">Aucun module actif</div>
                </div>
              </div>
            </div>

            {/* Message stylé pour aucun module */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-12 text-center">
              <div className="text-8xl mb-6">📱</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Aucune appli activée</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Vous n'avez pas encore activé d'applications. Découvrez notre collection de modules IA et commencez à explorer !
              </p>
              <div className="flex gap-4 justify-center">
                <Link 
                  href="/" 
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🚀 Découvrir nos modules
                </Link>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🔄 Actualiser
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  📊 Résumé de vos sélections
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{activeTokens.length}</div>
                  <div className="text-sm text-gray-600">Sélections actives</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {activeTokens.length}
                  </div>
                  <div className="text-sm text-gray-600">Modules accessibles</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {activeTokens.filter(access => access.expires_at).length > 0 
                      ? (() => {
                          const expiringModules = activeTokens.filter(access => access.expires_at);
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
                      : activeTokens.filter(access => !access.expires_at).length > 0 
                        ? '∞'
                        : '0'
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    {activeTokens.filter(access => access.expires_at).length > 0 
                      ? 'Temps restant (min)'
                      : activeTokens.filter(access => !access.expires_at).length > 0
                        ? 'Modules permanents'
                        : 'Aucun module'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTokens.map((access) => {
                const module = access.modules;
                const hasExpiration = access.expires_at;
                const daysRemaining = hasExpiration ? getDaysRemaining(access.expires_at) : null;
                
                return (
                  <div key={access.id} className={`bg-white rounded-xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                    hasExpiration && new Date(access.expires_at) <= new Date() 
                      ? 'border-red-300 bg-red-50' 
                      : hasExpiration && (new Date(access.expires_at).getTime() - new Date().getTime()) <= 24 * 60 * 60 * 1000
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    {/* Header de la carte */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold">
                          {module.title}
                        </h3>
                        {hasExpiration && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            new Date(access.expires_at) <= new Date() 
                              ? 'bg-red-500 text-white' 
                              : getTimeRemainingColor(access.expires_at).replace('bg-', 'bg-white/20 ').replace('text-', 'text-white ')
                          }`}>
                            {formatTimeRemaining(access.expires_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm opacity-90">
                        <span>📱 {module.category}</span>
                        <span>💰 €{module.price}</span>
                        <span>📅 {formatDate(access.created_at)}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Section Statistiques du Module */}
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                          <span className="mr-2">📊</span>
                          Statistiques du Module
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Temps restant */}
                          <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                            <div className={`text-2xl font-bold ${hasExpiration ? getTimeRemainingColor(access.expires_at) : 'text-green-600'}`}>
                              {hasExpiration ? formatTimeRemaining(access.expires_at) : '∞'}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Temps restant</div>
                          </div>
                          
                          {/* Utilisations restantes */}
                          <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                            {access.token && access.token.max_usage ? (
                              <>
                                <div className={`text-2xl font-bold ${getUsageColor(access.token.current_usage || 0, access.token.max_usage)}`}>
                                  {access.token.max_usage - (access.token.current_usage || 0)}
                                </div>
                                <div className="text-xs text-gray-500 font-medium">Utilisations restantes</div>
                              </>
                            ) : (
                              <>
                                <div className="text-2xl font-bold text-green-600">∞</div>
                                <div className="text-xs text-gray-500 font-medium">Utilisations illimitées</div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Barre de progression des utilisations */}
                        {access.token && access.token.max_usage && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-2 font-medium">
                              <span>Utilisations : {access.token.current_usage || 0} / {access.token.max_usage}</span>
                              <span>{Math.round(((access.token.current_usage || 0) / access.token.max_usage) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
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
                      </div>

                      {/* Informations du token d'accès */}
                      {access.token && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
                          <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center">
                            <span className="mr-2">🔑</span>
                            Détails du Token
                          </h4>
                          
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between bg-white rounded-lg p-2">
                              <span className="text-gray-600 font-medium">Module :</span> 
                              <span className="font-bold text-gray-800">{access.modules.title}</span>
                            </div>
                            
                            <div className="flex items-center justify-between bg-white rounded-lg p-2">
                              <span className="text-gray-600 font-medium">Niveau :</span> 
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                {access.token.access_level || 'standard'}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between bg-white rounded-lg p-2">
                              <span className="text-gray-600 font-medium">Permissions :</span> 
                              <span className="text-xs text-gray-600 font-medium">
                                {access.token.permissions ? access.token.permissions.join(', ') : 'read, access'}
                              </span>
                            </div>
                            
                            {access.token.expires_at && (
                              <div className="flex items-center justify-between bg-white rounded-lg p-2">
                                <span className="text-gray-600 font-medium">Expiration :</span> 
                                <span className="text-xs text-gray-600 font-medium">
                                  {formatTimeRemaining(access.token.expires_at)}
                                </span>
                              </div>
                            )}
                            
                            {access.token.max_usage && (
                              <div className="flex items-center justify-between bg-white rounded-lg p-2">
                                <span className="text-gray-600 font-medium">Usage max :</span> 
                                <span className="text-xs text-gray-600 font-medium">
                                  {access.token.max_usage}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Informations détaillées */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 mb-4 border border-yellow-100">
                        <h4 className="text-sm font-bold text-yellow-700 mb-3 flex items-center">
                          <span className="mr-2">📅</span>
                          Informations Détaillées
                        </h4>
                        
                        <div className="space-y-3">
                          {hasExpiration && (
                            <div className="flex items-center justify-between bg-white rounded-lg p-2">
                              <span className="text-sm text-gray-600 font-medium">Expire le :</span> 
                              <span className="text-xs text-gray-600 font-medium">
                                {formatDate(access.expires_at)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between bg-white rounded-lg p-2">
                            <span className="text-sm text-gray-600 font-medium">Type d'accès :</span> 
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                              {access.access_type}
                            </span>
                          </div>
                          
                          {getAccessConditions(module.title) && (
                            <div className="flex items-center justify-between bg-white rounded-lg p-2">
                              <span className="text-sm text-gray-600 font-medium">Conditions :</span> 
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                {getAccessConditions(module.title)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bouton spécial pour RuinedFooocus avec lien direct */}
                      {module.title.toLowerCase() === 'ruinedfooocus' ? (
                        <div className="space-y-2">
                          <button
                            onClick={async () => {
                              console.log('🔑 Accès RuinedFooocus via système de tokens depuis /encours');
                              
                              try {
                                const response = await fetch('/api/generate-module-token', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${session?.access_token}`
                                  },
                                  body: JSON.stringify({
                                    moduleId: module.id,
                                    moduleTitle: module.title,
                                    targetUrl: 'https://ruinedfooocus.regispailler.fr'
                                  }),
                                });
                                
                                if (!response.ok) {
                                  const errorData = await response.json();
                                  throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
                                }
                                
                                                                 const { token, expiresAt, accessUrl, reused, currentUsage, maxUsage } = await response.json();
                                 
                                 if (reused) {
                                   console.log('✅ Token existant réutilisé pour RuinedFooocus');
                                 } else {
                                   console.log('✅ Nouveau token généré avec succès pour RuinedFooocus');
                                 }
                                 
                                 setIframeModal({
                                   isOpen: true,
                                   url: accessUrl,
                                   title: 'RuinedFooocus'
                                 });

                                 // Mettre à jour immédiatement l'interface si on a les nouvelles données
                                 if (reused && typeof currentUsage === 'number' && typeof maxUsage === 'number') {
                                   console.log(`🔄 Mise à jour immédiate RuinedFooocus: ${currentUsage}/${maxUsage}`);
                                   setActiveTokens(prev => prev.map(sub => {
                                     if (sub.module_id === module.id) {
                                       return {
                                         ...sub,
                                         token: {
                                           ...sub.token,
                                           current_usage: currentUsage,
                                           max_usage: maxUsage,
                                           last_used_at: new Date().toISOString()
                                         }
                                       };
                                     }
                                     return sub;
                                   }));
                                 }

                                 // Mettre à jour les données du token après un délai
                                 setTimeout(() => {
                                   console.log('🔄 Mise à jour automatique des données après accès RuinedFooocus...');
                                   refreshTokenData();
                                 }, 1000);
                                 
                               } catch (error) {
                                 console.error('❌ Erreur lors de la génération du token:', error);
                                 alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                               }
                            }}
                            className="w-full px-4 py-2 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center justify-center"
                            title={`Accéder à ${module.title} avec authentification`}
                          >
                            <span className="text-xl mr-2">🔑</span>
                            Accéder à {module.title}
                          </button>
                          
                          <a 
                            href="https://da4be546aab3e23055.gradio.live/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center"
                            title="Accéder directement à l'application RuinedFooocus"
                          >
                            <span className="text-xl mr-2">🚀</span>
                            Accès direct Gradio
                          </a>
                        </div>
                      ) : (
                        <button 
                          className={`w-full px-4 py-2 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                            hasExpiration && new Date(access.expires_at) <= new Date()
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                          }`}
                          onClick={async () => {
                            if (hasExpiration && new Date(access.expires_at) <= new Date()) {
                              return;
                            }
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
                      )}
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