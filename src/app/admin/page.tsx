'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import Link from "next/link";
import Breadcrumb from "../../components/Breadcrumb";
import Header from '../../components/Header';

interface BlogArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  youtube_url?: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserApplication {
  id: string;
  user_id: string;
  module_id: string;
  module_title: string;
  access_level: 'basic' | 'premium' | 'admin';
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

interface AccessToken {
  id: string;
  name: string;
  description: string;
  module_id: string;
  module_name: string;
  access_level: 'basic' | 'premium' | 'admin';
  permissions: string[];
  max_usage: number;
  current_usage: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at: string;
  jwt_token: string;
  last_used_at?: string;
  usage_log: any[];
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'blog' | 'modules' | 'users' | 'linkedin' | 'menus' | 'tokens'>('overview');
  const [loading, setLoading] = useState(true);
  
  // États pour les données
  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userApplications, setUserApplications] = useState<{ [userId: string]: UserApplication[] }>({});
  const [userTokens, setUserTokens] = useState<{ [userId: string]: AccessToken[] }>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserAppsModal, setShowUserAppsModal] = useState(false);
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    totalModules: 0,
    modulesWithDetails: 0,
    totalUsers: 0,
    adminUsers: 0,
    totalLinkedInPosts: 0,
    publishedLinkedInPosts: 0
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        setCurrentUser(currentSession.user);
        checkAdminStatus(currentSession.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setCurrentUser(session?.user || null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Erreur lors de la vérification admin:', error);
        setIsAdmin(false);
        return;
      }
      const userIsAdmin = data?.role === 'admin';
      setIsAdmin(userIsAdmin);
      if (userIsAdmin) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la vérification admin:', err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      // Charger les articles de blog
      const { data: articles } = await supabase
        .from('blog_articles')
        .select('*')
        .order('created_at', { ascending: false });

      // Charger les modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      // Charger les utilisateurs
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Charger les posts LinkedIn
      const { data: linkedinPosts } = await supabase
        .from('linkedin_posts')
        .select('*')
        .order('created_at', { ascending: false });

      // Charger les applications des utilisateurs
      let userAppsData = null;
      try {
        const { data: appsData, error: appsError } = await supabase
          .from('user_applications')
          .select(`
            id,
            user_id,
            module_id,
            access_level,
            is_active,
            created_at,
            expires_at,
            modules!inner(title)
          `)
          .order('created_at', { ascending: false });
        
        if (appsError) {
          console.log('Table user_applications non disponible:', appsError.message);
        } else {
          userAppsData = appsData;
        }
      } catch (error) {
        console.log('Erreur lors du chargement des applications utilisateur:', error);
      }

      // Charger les tokens d'accès des utilisateurs
      const { data: userTokensData } = await supabase
        .from('access_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      // Organiser les applications par utilisateur
      const appsByUser: { [userId: string]: UserApplication[] } = {};
      if (userAppsData) {
        userAppsData.forEach(app => {
          if (!appsByUser[app.user_id]) {
            appsByUser[app.user_id] = [];
          }
          appsByUser[app.user_id].push({
            id: app.id,
            user_id: app.user_id,
            module_id: app.module_id,
            module_title: app.modules?.title || 'Module inconnu',
            access_level: app.access_level,
            is_active: app.is_active,
            created_at: app.created_at,
            expires_at: app.expires_at
          });
        });
      }

      // Organiser les tokens par utilisateur
      const tokensByUser: { [userId: string]: AccessToken[] } = {};
      if (userTokensData) {
        userTokensData.forEach(token => {
          if (!tokensByUser[token.created_by]) {
            tokensByUser[token.created_by] = [];
          }
          tokensByUser[token.created_by].push(token);
        });
      }

      setBlogArticles(articles || []);
      setModules(modulesData || []);
      setUsers(usersData || []);
      setUserApplications(appsByUser);
      setUserTokens(tokensByUser);

      // Calculer les statistiques
      const publishedArticles = articles?.filter(article => article.is_published).length || 0;
      const modulesWithDetails = modulesData?.filter(module => module.youtube_url).length || 0;
      const adminUsers = usersData?.filter(user => user.role === 'admin').length || 0;
      const publishedLinkedInPosts = linkedinPosts?.filter(post => post.is_published).length || 0;

      setStats({
        totalArticles: articles?.length || 0,
        publishedArticles,
        totalModules: modulesData?.length || 0,
        modulesWithDetails,
        totalUsers: usersData?.length || 0,
        adminUsers,
        totalLinkedInPosts: linkedinPosts?.length || 0,
        publishedLinkedInPosts
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        const { error } = await supabase
          .from('blog_articles')
          .delete()
          .eq('id', articleId);
        
        if (error) {
          alert('Erreur lors de la suppression');
        } else {
          fetchAllData();
          alert('Article supprimé avec succès');
        }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      try {
        // Supprimer le module directement
        const { error } = await supabase
          .from('modules')
          .delete()
          .eq('id', moduleId);
        
        if (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression');
        } else {
          fetchAllData();
          alert('Module supprimé avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
        alert('Erreur lors de la mise à jour du rôle');
      } else {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        alert('Rôle mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      alert('Erreur lors de la mise à jour du rôle');
    }
  };

  // Gérer l'affichage des applications d'un utilisateur
  const handleViewUserApps = (user: User) => {
    setSelectedUser(user);
    setShowUserAppsModal(true);
  };

  // Supprimer une application utilisateur
  const handleDeleteUserApp = async (appId: string, userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_applications')
        .delete()
        .eq('id', appId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'application');
      } else {
        // Mettre à jour l'état local
        setUserApplications(prev => ({
          ...prev,
          [userId]: prev[userId]?.filter(app => app.id !== appId) || []
        }));
        alert('Application supprimée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'application');
    }
  };

  // Modifier le statut d'une application utilisateur
  const handleToggleUserAppStatus = async (appId: string, userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_applications')
        .update({ is_active: !currentStatus })
        .eq('id', appId);

      if (error) {
        console.error('Erreur lors de la modification:', error);
        alert('Erreur lors de la modification du statut');
      } else {
        // Mettre à jour l'état local
        setUserApplications(prev => ({
          ...prev,
          [userId]: prev[userId]?.map(app => 
            app.id === appId ? { ...app, is_active: !currentStatus } : app
          ) || []
        }));
        alert('Statut modifié avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification du statut');
    }
  };

  // Supprimer un token d'accès
  const handleDeleteUserToken = async (tokenId: string, userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce token ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('access_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) {
        console.error('Erreur lors de la suppression du token:', error);
        alert('Erreur lors de la suppression du token');
      } else {
        // Mettre à jour l'état local
        setUserTokens(prev => ({
          ...prev,
          [userId]: prev[userId]?.filter(token => token.id !== tokenId) || []
        }));
        alert('Token supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      alert('Erreur lors de la suppression du token');
    }
  };

  // Contrôles d'accès
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez être connecté pour accéder à cette page.</p>
            <Link href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Se connecter</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez avoir les droits d'administrateur pour accéder à cette page.</p>
            <Link href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20">
        <Breadcrumb />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration Globale</h1>
              <p className="text-gray-600 mt-2">Gérez tous les aspects de votre plateforme</p>
            </div>

          </div>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'blog'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📝 Articles de blog
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'modules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🧩 Modules
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'linkedin'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            💼 LinkedIn
          </button>
          <button
            onClick={() => setActiveTab('menus')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'menus'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🍽️ Menus
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tokens'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🔑 Tokens
          </button>
        </div>

        {/* Contenu des onglets */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : (
          <>
            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Articles de blog</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalArticles}</p>
                        <p className="text-sm text-gray-500">{stats.publishedArticles} publiés</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Modules</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalModules}</p>
                        <p className="text-sm text-gray-500">{stats.modulesWithDetails} avec pages détaillées</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Utilisateurs</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                        <p className="text-sm text-gray-500">{stats.adminUsers} administrateurs</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Posts LinkedIn</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalLinkedInPosts}</p>
                        <p className="text-sm text-gray-500">{stats.publishedLinkedInPosts} publiés</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href="/admin/blog"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="font-medium">Nouvel article</span>
                    </Link>
                    <Link
                      href="/admin/modules"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="font-medium">Nouveau module</span>
                    </Link>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <span className="font-medium">Gérer utilisateurs</span>
                    </button>
                    <Link
                      href="/admin/linkedin"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="font-medium">Gérer LinkedIn</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Articles de blog */}
            {activeTab === 'blog' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Articles de blog</h2>
                  <Link
                    href="/admin/blog"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nouvel article
                  </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {blogArticles.map((article) => (
                          <tr key={article.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{article.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {article.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                article.is_published 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {article.is_published ? 'Publié' : 'Brouillon'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(article.created_at).toLocaleDateString()}
                            </td>
                                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               <div className="flex space-x-2">
                                 <Link
                                   href={`/admin/blog`}
                                   className="text-blue-600 hover:text-blue-900"
                                 >
                                   Gérer
                                 </Link>
                                 <button
                                   onClick={() => handleDeleteArticle(article.id)}
                                   className="text-red-600 hover:text-red-900"
                                 >
                                   Supprimer
                                 </button>
                               </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modules */}
            {activeTab === 'modules' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
                  <div className="flex space-x-3">
                    <Link
                      href="/admin/modules"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Gestion complète
                    </Link>
                    <Link
                      href="/admin/modules"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Nouveau module
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {modules.map((module) => (
                          <tr key={module.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{module.title}</div>
                              <div 
                                className="text-sm text-gray-500"
                                dangerouslySetInnerHTML={{ __html: module.description.substring(0, 50) + '...' }}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                {module.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {module.price}€
                            </td>

                                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               <div className="flex space-x-2">
                                 <Link
                                   href={`/admin/modules`}
                                   className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                                 >
                                   <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                   </svg>
                                   Gestion complète
                                 </Link>
                                 <button
                                   onClick={() => handleDeleteModule(module.id)}
                                   className="text-red-600 hover:text-red-900"
                                 >
                                   Supprimer
                                 </button>
                               </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Utilisateurs */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Utilisateurs</h2>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => {
                          const userApps = userApplications[user.id] || [];
                          const userTokensList = userTokens[user.id] || [];
                          const activeApps = userApps.filter(app => app.is_active);
                          const activeTokens = userTokensList.filter(token => token.is_active);
                          
                          return (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="user">Utilisateur</option>
                                  <option value="admin">Administrateur</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  {userApps.length > 0 ? (
                                    <>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-900">
                                          {userApps.length} total
                                        </span>
                                        {activeApps.length > 0 && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {activeApps.length} actives
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleViewUserApps(user)}
                                        className="text-xs text-blue-600 hover:text-blue-900 underline"
                                      >
                                        Gérer les applications
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-sm text-gray-500">Aucune application</span>
                                      <span className="text-xs text-gray-400">Table user_applications non configurée</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  {userTokensList.length > 0 ? (
                                    <>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-900">
                                          {userTokensList.length} total
                                        </span>
                                        {activeTokens.length > 0 && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {activeTokens.length} actifs
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleViewUserApps(user)}
                                        className="text-xs text-purple-600 hover:text-purple-900 underline"
                                      >
                                        Voir les tokens
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex flex-col space-y-1">
                                      <span className="text-sm text-gray-500">Aucun token</span>
                                      <span className="text-xs text-gray-400">Aucun token d'accès créé</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewUserApps(user)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Gérer
                                  </button>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.role === 'admin' 
                                      ? 'bg-purple-100 text-purple-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* LinkedIn */}
            {activeTab === 'linkedin' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Gestion LinkedIn</h2>
                  <Link
                    href="/admin/linkedin"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Accéder à l'interface LinkedIn
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configuration LinkedIn */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 ml-3">Configuration LinkedIn</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Configurez vos credentials LinkedIn pour publier automatiquement du contenu depuis votre plateforme.
                    </p>
                    <Link
                      href="/admin/linkedin"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Configurer LinkedIn
                    </Link>
                  </div>

                  {/* Statistiques LinkedIn */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 ml-3">Statistiques</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total posts</span>
                        <span className="font-semibold">{stats.totalLinkedInPosts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posts publiés</span>
                        <span className="font-semibold text-green-600">{stats.publishedLinkedInPosts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posts en brouillon</span>
                        <span className="font-semibold text-yellow-600">{stats.totalLinkedInPosts - stats.publishedLinkedInPosts}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fonctionnalités LinkedIn */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="font-medium">Créer des posts</span>
                    </div>
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Programmer des publications</span>
                    </div>
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-medium">Suivre les statistiques</span>
                    </div>
                  </div>
                </div>

                {/* Lien vers l'interface complète */}
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Interface LinkedIn complète</h3>
                  <p className="text-blue-700 mb-4">
                    Accédez à l'interface complète pour gérer tous vos posts LinkedIn, configurer les credentials et suivre les performances.
                  </p>
                  <Link
                    href="/admin/linkedin"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Accéder à l'interface LinkedIn
                  </Link>
                </div>
              </div>
            )}

            {/* Gestion des menus */}
            {activeTab === 'menus' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Gestion des menus</h2>
                      <p className="text-gray-600 mt-2">Gérez les menus et les pages de votre site web</p>
                    </div>
                    <Link
                      href="/admin/menus"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Gérer les menus
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Menu principal */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">Menu principal</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Navigation principale du site avec les liens essentiels
                      </p>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Éléments :</span> Accueil, Communauté, Blog
                      </div>
                    </div>

                    {/* Menu footer */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">Menu footer</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Liens du pied de page avec informations légales
                      </p>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Éléments :</span> À propos, Contact, Tarifs
                      </div>
                    </div>

                    {/* Menu mobile */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">Menu mobile</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Navigation adaptée aux appareils mobiles
                      </p>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Éléments :</span> Version mobile du menu principal
                      </div>
                    </div>
                  </div>

                  {/* Fonctionnalités */}
                  <div className="mt-6 bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Fonctionnalités disponibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="font-medium">Créer et modifier des menus</span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <span className="font-medium">Gérer les éléments de menu</span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Contrôle d'accès par rôle</span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <svg className="w-5 h-5 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Gestion des pages</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gestion des tokens */}
            {activeTab === 'tokens' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Gestion des tokens d'accès</h2>
                      <p className="text-gray-600 mt-2">Créez et gérez les tokens d'accès aux modules avec des paramètres personnalisables</p>
                    </div>
                    <Link
                      href="/admin/tokens"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Gérer les tokens
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tokens Premium */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">Tokens Premium</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Accès complet aux modules avec toutes les fonctionnalités
                      </p>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Permissions :</span> read, write, access, advanced_features
                      </div>
                    </div>

                    {/* Tokens Basic */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">Tokens Basic</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Accès limité aux fonctionnalités de base
                      </p>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Permissions :</span> read, access
                      </div>
                    </div>

                    {/* Tokens Admin */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 ml-2">Tokens Admin</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Accès administrateur avec toutes les permissions
                      </p>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Permissions :</span> Toutes les permissions
                      </div>
                    </div>
                  </div>

                  {/* Fonctionnalités */}
                  <div className="mt-6 bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Fonctionnalités disponibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="font-medium">Créer des tokens personnalisés</span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <span className="font-medium">Gérer les permissions</span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Contrôle de l'expiration</span>
                      </div>
                      <div className="flex items-center p-3 bg-white rounded-lg">
                        <svg className="w-5 h-5 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">Suivi de l'utilisation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Modal pour gérer les applications d'un utilisateur */}
      {showUserAppsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Applications de {selectedUser.email}
                </h2>
                <button
                  onClick={() => {
                    setShowUserAppsModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {/* Section Applications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Applications activées</h3>
                  {userApplications[selectedUser.id] && userApplications[selectedUser.id].length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau d'accès</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'activation</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {userApplications[selectedUser.id].map((app) => (
                              <tr key={app.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{app.module_title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    app.access_level === 'admin' ? 'bg-red-100 text-red-800' :
                                    app.access_level === 'premium' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {app.access_level}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    app.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {app.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(app.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleToggleUserAppStatus(app.id, selectedUser.id, app.is_active)}
                                      className={`px-3 py-1 text-xs rounded transition-colors ${
                                        app.is_active 
                                          ? 'bg-red-600 text-white hover:bg-red-700' 
                                          : 'bg-green-600 text-white hover:bg-green-700'
                                      }`}
                                    >
                                      {app.is_active ? 'Désactiver' : 'Activer'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUserApp(app.id, selectedUser.id)}
                                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600">Aucune application activée pour cet utilisateur</p>
                    </div>
                  )}
                </div>

                {/* Section Tokens d'accès */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔑 Tokens d'accès</h3>
                  {userTokens[selectedUser.id] && userTokens[selectedUser.id].length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisation</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {userTokens[selectedUser.id].map((token) => {
                              const isExpired = new Date(token.expires_at) < new Date();
                              const usagePercentage = token.max_usage > 0 ? (token.current_usage / token.max_usage) * 100 : 0;
                              
                              return (
                                <tr key={token.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{token.name}</div>
                                    <div className="text-sm text-gray-500">{token.description}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{token.module_name}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      token.access_level === 'admin' ? 'bg-red-100 text-red-800' :
                                      token.access_level === 'premium' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {token.access_level}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {token.current_usage} / {token.max_usage || '∞'}
                                    </div>
                                    {token.max_usage > 0 && (
                                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                        <div 
                                          className={`h-1 rounded-full ${
                                            usagePercentage > 80 ? 'bg-red-500' :
                                            usagePercentage > 60 ? 'bg-yellow-500' :
                                            'bg-green-500'
                                          }`}
                                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                        ></div>
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      token.is_active 
                                        ? isExpired 
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {token.is_active ? (isExpired ? 'Expiré' : 'Actif') : 'Inactif'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      onClick={() => handleDeleteUserToken(token.id, selectedUser.id)}
                                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    >
                                      Supprimer
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <p className="text-gray-600">Aucun token d'accès pour cet utilisateur</p>
                    </div>
                  )}
                </div>

                {/* Statistiques utilisateur */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Statistiques utilisateur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {userApplications[selectedUser.id]?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Applications totales</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {userApplications[selectedUser.id]?.filter(app => app.is_active).length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Applications actives</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {userTokens[selectedUser.id]?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Tokens d'accès</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {userTokens[selectedUser.id]?.filter(token => token.is_active && new Date(token.expires_at) > new Date()).length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Tokens valides</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 