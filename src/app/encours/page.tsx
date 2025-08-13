'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Header from '../../components/Header';

interface UserModule {
  id: string;
  module_id: string;
  module_title: string;
  module_description: string;
  module_category: string;
  module_url: string;
  access_type: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  current_usage?: number;
  max_usage?: number;
}

export default function EncoursPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userModules, setUserModules] = useState<UserModule[]>([]);
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
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setRole(data.role);
        } else {
          setRole('user');
        }
        console.log('✅ Rôle utilisateur défini:', data?.role || 'user');
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle:', error);
        setRole('user');
      }
    };

    if (user) {
      fetchUserRole();
    }
  }, [user]);

  // Charger les modules souscrits par l'utilisateur et les tokens d'accès
  useEffect(() => {
    const fetchUserModules = async () => {
      if (!user?.id) {
        console.log('⚠️ Pas d\'utilisateur connecté');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('🔍 Chargement des modules pour utilisateur:', user.id);
        
        // Récupérer les modules souscrits via user_applications
        console.log('🔍 Récupération des modules utilisateur...');
        const { data: userModulesData, error: userModulesError } = await supabase
          .from('user_applications')
          .select(`
            id,
            module_id,
            module_title,
            access_level,
            expires_at,
            is_active,
            created_at,
            modules (
              id,
              title,
              description,
              category,
              url,
              price
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (userModulesError) {
          console.error('❌ Erreur chargement modules utilisateur:', userModulesError);
        }

        // Récupérer les tokens d'accès créés manuellement pour cet utilisateur
        console.log('🔍 Récupération des tokens d\'accès...');
        const { data: accessTokensData, error: tokensError } = await supabase
          .from('access_tokens')
          .select(`
            id,
            name,
            description,
            module_id,
            module_name,
            access_level,
            permissions,
            max_usage,
            current_usage,
            is_active,
            created_by,
            created_at,
            expires_at
          `)
          .eq('created_by', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (tokensError) {
          console.error('❌ Erreur chargement tokens:', tokensError);
        }

        console.log('✅ Modules utilisateur chargés:', userModulesData?.length || 0);
        console.log('✅ Tokens d\'accès chargés:', accessTokensData?.length || 0);
        
        // Transformer les modules user_applications
        const transformedModules: UserModule[] = (userModulesData || [])
          .filter(access => {
            // Filtrer les accès non expirés
            if (!access.expires_at) return true;
            return new Date(access.expires_at) > new Date();
          })
          .map(access => ({
            id: access.id,
            module_id: access.module_id,
            module_title: access.module_title || access.modules?.[0]?.title || `Module ${access.module_id}`,
            module_description: access.modules?.[0]?.description || 'Description non disponible',
            module_category: access.modules?.[0]?.category || 'Catégorie inconnue',
            module_url: access.modules?.[0]?.url || '',
            access_type: access.access_level,
            expires_at: access.expires_at,
            is_active: access.is_active,
            created_at: access.created_at,
            current_usage: 0, // user_applications n'a pas de current_usage
            max_usage: undefined // user_applications n'a pas de max_usage
          }));

        // Transformer les tokens d'accès en modules
        const transformedTokens: UserModule[] = (accessTokensData || [])
          .filter(token => {
            // Filtrer les tokens non expirés
            if (!token.expires_at) return true;
            return new Date(token.expires_at) > new Date();
          })
          .map(token => ({
            id: `token-${token.id}`,
            module_id: token.module_id?.toString() || 'unknown',
            module_title: token.name || token.module_name || `Token ${token.id}`,
            module_description: token.description || 'Accès via token',
            module_category: 'Token d\'accès',
            module_url: '', // Les tokens n'ont pas d'URL directe
            access_type: `Token (${token.access_level})`,
            expires_at: token.expires_at,
            is_active: token.is_active,
            created_at: token.created_at,
            current_usage: token.current_usage || 0,
            max_usage: token.max_usage || null
          }));

        // Combiner les deux listes
        const allModules = [...transformedModules, ...transformedTokens];
        
        console.log('✅ Total modules et tokens:', allModules.length);
        console.log('🔍 Modules et tokens combinés:', allModules);
        setUserModules(allModules);
        setError(null);
        
      } catch (error) {
        console.error('❌ Erreur générale:', error);
        console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
        setError(`Erreur lors du chargement des modules: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        setUserModules([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && sessionChecked) {
      fetchUserModules();
    }
  }, [user, sessionChecked]);

  // Fonction pour accéder à un module
  const accessModule = async (module: UserModule) => {
    try {
      console.log('🚀 Accès au module:', module.module_title);
      
      // Vérifier si c'est un token d'accès
      if (module.module_category === 'Token d\'accès') {
        // Pour les tokens, rediriger vers la page du module associé
        if (module.module_id && module.module_id !== 'unknown') {
          router.push(`/card/${module.module_id}`);
        } else {
          alert('Ce token d\'accès n\'est pas associé à un module spécifique');
        }
        return;
      }
      
      // Vérifier si le module a une URL
      if (module.module_url) {
        // Ouvrir dans un iframe modal
        setIframeModal({
          isOpen: true,
          url: module.module_url,
          title: module.module_title
        });
      } else {
        // Rediriger vers la page du module
        router.push(`/card/${module.module_id}`);
      }
    } catch (error) {
      console.error('❌ Erreur accès module:', error);
      alert('Erreur lors de l\'accès au module');
    }
  };

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    setRefreshing(true);
    
    // Recharger les modules access_modules
    const { data: userModulesData, error: modulesError } = await supabase
      .from('access_modules')
      .select(`
        id,
        module_id,
        access_type,
        expires_at,
        is_active,
        created_at,
        current_usage,
        max_usage,
        modules (
          id,
          title,
          description,
          category,
          url,
          price
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Recharger les tokens d'accès
    const { data: accessTokensData, error: tokensError } = await supabase
      .from('access_tokens')
      .select(`
        id,
        name,
        description,
        module_id,
        module_name,
        access_level,
        permissions,
        max_usage,
        current_usage,
        is_active,
        created_by,
        created_at,
        expires_at
      `)
      .eq('created_by', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!modulesError && !tokensError) {
      // Transformer les modules access_modules
      const transformedModules: UserModule[] = (userModulesData || [])
        .filter(access => {
          if (!access.expires_at) return true;
          return new Date(access.expires_at) > new Date();
        })
        .map(access => ({
          id: access.id,
          module_id: access.module_id,
          module_title: access.modules?.[0]?.title || `Module ${access.module_id}`,
          module_description: access.modules?.[0]?.description || 'Description non disponible',
          module_category: access.modules?.[0]?.category || 'Catégorie inconnue',
          module_url: access.modules?.[0]?.url || '',
          access_type: access.access_type,
          expires_at: access.expires_at,
          is_active: access.is_active,
          created_at: access.created_at,
          current_usage: access.current_usage || 0,
          max_usage: access.max_usage || null
        }));

      // Transformer les tokens d'accès
      const transformedTokens: UserModule[] = (accessTokensData || [])
        .filter(token => {
          if (!token.expires_at) return true;
          return new Date(token.expires_at) > new Date();
        })
        .map(token => ({
          id: `token-${token.id}`,
          module_id: token.module_id?.toString() || 'unknown',
          module_title: token.name || token.module_name || `Token ${token.id}`,
          module_description: token.description || 'Accès via token',
          module_category: 'Token d\'accès',
          module_url: '',
          access_type: `Token (${token.access_level})`,
          expires_at: token.expires_at,
          is_active: token.is_active,
          created_at: token.created_at,
          current_usage: token.current_usage || 0,
          max_usage: token.max_usage || null
        }));

      // Combiner les deux listes
      const allModules = [...transformedModules, ...transformedTokens];
      setUserModules(allModules);
    }
    setRefreshing(false);
  };

  // Fonctions utilitaires
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
    const days = getDaysRemaining(endDate);
    if (days < 0) return 'Expiré';
    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return 'Expire demain';
    if (days < 7) return `Expire dans ${days} jours`;
    if (days < 30) return `Expire dans ${Math.floor(days / 7)} semaines`;
    return `Expire dans ${Math.floor(days / 30)} mois`;
  };

  const getTimeRemainingColor = (endDate: string) => {
    const days = getDaysRemaining(endDate);
    if (days < 0) return 'text-red-600';
    if (days <= 3) return 'text-orange-600';
    if (days <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageColor = (current: number, max: number) => {
    const percentage = max ? (current / max) * 100 : 0;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Contrôles d'accès
  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Vérification de la session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez être connecté pour accéder à vos applications.</p>
            <Link href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Se connecter</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 Mes Applications</h1>
              <p className="text-gray-600">Gérez vos modules souscrits et accédez à vos applications</p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualisation...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualiser
                </>
              )}
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos applications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={refreshData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : userModules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">📱</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Aucune application activée</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Vous n'avez pas encore souscrit à des modules. Découvrez notre collection d'applications IA et commencez à explorer !
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚀 Découvrir nos modules
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Résumé de vos applications</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userModules.length}</div>
                  <div className="text-sm text-gray-600">Total actifs</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {userModules.filter(m => !m.expires_at).length}
                  </div>
                  <div className="text-sm text-gray-600">Accès permanents</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {userModules.filter(m => m.expires_at && new Date(m.expires_at) > new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Accès temporaires</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {userModules.filter(m => m.module_category === 'Token d\'accès').length}
                  </div>
                  <div className="text-sm text-gray-600">Tokens d'accès</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {userModules.filter(m => m.expires_at && new Date(m.expires_at) <= new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Accès expirés</div>
                </div>
              </div>
            </div>

            {/* Grille des modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userModules.map((module) => {
                const isExpired = !!(module.expires_at && new Date(module.expires_at) <= new Date());
                const isExpiringSoon = module.expires_at && getDaysRemaining(module.expires_at) <= 7;
                
                return (
                  <div key={module.id} className={`bg-white rounded-xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                    isExpired 
                      ? 'border-red-300 bg-red-50' 
                      : isExpiringSoon
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    
                    {/* En-tête de la carte */}
                    <div className={`p-6 text-white ${
                      module.module_category === 'Token d\'accès' 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold truncate">
                          {module.module_title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {/* Badge pour les tokens */}
                          {module.module_category === 'Token d\'accès' && (
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
                              🔑 Token
                            </span>
                          )}
                          {module.expires_at && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isExpired 
                                ? 'bg-red-500 text-white' 
                                : isExpiringSoon
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-white/20 text-white'
                            }`}>
                              {formatTimeRemaining(module.expires_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm opacity-90">
                        <span>📱 {module.module_category}</span>
                        <span>🔑 {module.access_type}</span>
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="p-6">
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {module.module_description}
                      </p>

                      {/* Informations d'utilisation */}
                      {module.max_usage && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Utilisations : {module.current_usage || 0} / {module.max_usage}</span>
                            <span>{Math.round(((module.current_usage || 0) / module.max_usage) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                getUsageColor(module.current_usage || 0, module.max_usage).includes('red') ? 'bg-red-500' :
                                getUsageColor(module.current_usage || 0, module.max_usage).includes('orange') ? 'bg-orange-500' :
                                getUsageColor(module.current_usage || 0, module.max_usage).includes('yellow') ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(((module.current_usage || 0) / module.max_usage) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Informations de date */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Créé le :</span>
                          <span className="text-gray-700">{formatDate(module.created_at)}</span>
                        </div>
                        {module.expires_at && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Expire le :</span>
                            <span className={`font-medium ${getTimeRemainingColor(module.expires_at)}`}>
                              {formatDate(module.expires_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bouton d'accès */}
                      <button 
                        onClick={() => accessModule(module)}
                        disabled={isExpired}
                        className={`w-full px-4 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                          isExpired
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                        }`}
                        title={isExpired ? 'Module expiré' : `Accéder à ${module.module_title}`}
                      >
                        <span className="text-xl mr-2">
                          {isExpired ? '⏰' : '🚀'}
                        </span>
                        {isExpired ? 'Module expiré' : 'Accéder à l\'application'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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