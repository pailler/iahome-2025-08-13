'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Header from '../../../components/Header';

interface LinkedInPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at?: string;
  published_at?: string;
  linkedin_post_id?: string;
  created_at: string;
}

interface BlogArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  is_published: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
}

export default function LinkedInAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour les données
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPost[]>([]);
  const [blogArticles, setBlogArticles] = useState<BlogArticle[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [linkedinConfig, setLinkedinConfig] = useState({
    accessToken: '',
    companyId: '',
    isConnected: false
  });

  // États pour le formulaire
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    sourceType: 'manual' as 'manual' | 'blog' | 'module',
    sourceId: '',
    scheduledAt: '',
    status: 'draft' as 'draft' | 'scheduled'
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
        loadLinkedInConfig();
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la vérification admin:', err);
      setIsAdmin(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Charger les posts LinkedIn
      const { data: postsData, error: postsError } = await supabase
        .from('linkedin_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Erreur chargement posts LinkedIn:', postsError);
      }

      // Charger les articles de blog
      const { data: articlesData, error: articlesError } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('is_published', true)
        .order('title', { ascending: true });

      // Charger les modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('title', { ascending: true });

      setLinkedinPosts(postsData || []);
      setBlogArticles(articlesData || []);
      setModules(modulesData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedInConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('linkedin_config')
        .select('*')
        .single();
      
      if (!error && data) {
        setLinkedinConfig({
          accessToken: data.access_token || '',
          companyId: data.company_id || '',
          isConnected: !!(data.access_token && data.company_id)
        });
      }
    } catch (error) {
      console.error('Erreur chargement config LinkedIn:', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      const { data, error } = await supabase
        .from('linkedin_posts')
        .insert({
          title: newPost.title,
          content: newPost.content,
          status: newPost.status,
          scheduled_at: newPost.scheduledAt || null,
          source_type: newPost.sourceType,
          source_id: newPost.sourceId || null
        })
        .select()
        .single();

      if (error) {
        alert('Erreur lors de la création du post');
        return;
      }

      // Si le post est programmé, lancer la publication
      if (newPost.status === 'scheduled' && linkedinConfig.isConnected) {
        await scheduleLinkedInPost(data);
      }

      setNewPost({
        title: '',
        content: '',
        sourceType: 'manual',
        sourceId: '',
        scheduledAt: '',
        status: 'draft'
      });

      fetchAllData();
      alert('Post créé avec succès');
    } catch (error) {
      console.error('Erreur création post:', error);
      alert('Erreur lors de la création du post');
    }
  };

  const scheduleLinkedInPost = async (post: LinkedInPost) => {
    try {
      const response = await fetch('/api/linkedin/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          title: post.title,
          content: post.content,
          scheduledAt: post.scheduled_at
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur publication LinkedIn');
      }

      const result = await response.json();
      
      // Mettre à jour le post avec l'ID LinkedIn
      await supabase
        .from('linkedin_posts')
        .update({
          linkedin_post_id: result.linkedinPostId,
          status: 'scheduled'
        })
        .eq('id', post.id);

    } catch (error) {
      console.error('Erreur programmation LinkedIn:', error);
      // Marquer le post comme échoué
      await supabase
        .from('linkedin_posts')
        .update({ status: 'failed' })
        .eq('id', post.id);
    }
  };

  const handlePublishNow = async (postId: string) => {
    try {
      const post = linkedinPosts.find(p => p.id === postId);
      if (!post) return;

      const response = await fetch('/api/linkedin/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          title: post.title,
          content: post.content,
          publishNow: true
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur publication LinkedIn');
      }

      const result = await response.json();
      
      // Mettre à jour le statut
      await supabase
        .from('linkedin_posts')
        .update({
          linkedin_post_id: result.linkedinPostId,
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', post.id);

      fetchAllData();
      alert('Post publié avec succès sur LinkedIn !');

    } catch (error) {
      console.error('Erreur publication LinkedIn:', error);
      alert('Erreur lors de la publication sur LinkedIn');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      try {
        const { error } = await supabase
          .from('linkedin_posts')
          .delete()
          .eq('id', postId);
        
        if (error) {
          alert('Erreur lors de la suppression');
        } else {
          fetchAllData();
          alert('Post supprimé avec succès');
        }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSourceChange = (sourceType: 'manual' | 'blog' | 'module', sourceId: string) => {
    setNewPost(prev => ({ ...prev, sourceType, sourceId }));
    
    if (sourceType === 'blog' && sourceId) {
      const article = blogArticles.find(a => a.id === sourceId);
      if (article) {
        setNewPost(prev => ({
          ...prev,
          title: article.title,
          content: `${article.content.substring(0, 200)}...\n\n#IA #Innovation #Tech`
        }));
      }
    } else if (sourceType === 'module' && sourceId) {
      const module = modules.find(m => m.id === sourceId);
      if (module) {
        setNewPost(prev => ({
          ...prev,
          title: `Nouveau module IA : ${module.title}`,
          content: `Découvrez notre nouveau module : ${module.title}\n\n${module.description}\n\nPrix : ${module.price}€\n\n#IA #Innovation #Tech #IAhome`
        }));
      }
    }
  };

  // Contrôles d'accès
  if (!session) {
    return (
      <div className='min-h-screen bg-gray-50 pt-20'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>Accès refusé</h1>
            <p className='text-gray-600 mb-8'>Vous devez être connecté pour accéder à cette page.</p>
            <Link href='/login' className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>Se connecter</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Header />
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>Accès refusé</h1>
            <p className='text-gray-600 mb-8'>Vous devez avoir les droits d'administrateur pour accéder à cette page.</p>
            <Link href='/' className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Gestion LinkedIn</h1>
          <p className='text-gray-600'>Publiez automatiquement vos contenus sur LinkedIn</p>
        </div>

        {/* Configuration LinkedIn */}
        <div className='bg-white rounded-lg shadow p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Configuration LinkedIn</h2>
          {linkedinConfig.isConnected ? (
            <div className='flex items-center space-x-4'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <span className='text-green-700 font-medium'>Connecté à LinkedIn</span>
              <button className='text-sm text-blue-600 hover:text-blue-800'>Reconfigurer</button>
            </div>
          ) : (
            <div className='space-y-4'>
              <p className='text-gray-600'>Connectez votre compte LinkedIn pour publier automatiquement</p>
              <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'>
                Connecter LinkedIn
              </button>
            </div>
          )}
        </div>

        {/* Créer un nouveau post */}
        <div className='bg-white rounded-lg shadow p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Créer un nouveau post</h2>
          
          <div className='space-y-4'>
            {/* Source du contenu */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Source du contenu
              </label>
              <select
                value={newPost.sourceType}
                onChange={(e) => handleSourceChange(e.target.value as any, '')}
                className='w-full border border-gray-300 rounded-lg px-3 py-2'
              >
                <option value='manual'>Contenu manuel</option>
                <option value='blog'>Article de blog</option>
                <option value='module'>Module IA</option>
              </select>
            </div>

            {/* Sélection de la source */}
            {newPost.sourceType === 'blog' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sélectionner un article
                </label>
                <select
                  value={newPost.sourceId}
                  onChange={(e) => handleSourceChange('blog', e.target.value)}
                  className='w-full border border-gray-300 rounded-lg px-3 py-2'
                >
                  <option value=''>Choisir un article...</option>
                  {blogArticles.map(article => (
                    <option key={article.id} value={article.id}>
                      {article.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {newPost.sourceType === 'module' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sélectionner un module
                </label>
                <select
                  value={newPost.sourceId}
                  onChange={(e) => handleSourceChange('module', e.target.value)}
                  className='w-full border border-gray-300 rounded-lg px-3 py-2'
                >
                  <option value=''>Choisir un module...</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.title} ({module.price}€)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Titre */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Titre
              </label>
              <input
                type='text'
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className='w-full border border-gray-300 rounded-lg px-3 py-2'
                placeholder='Titre du post LinkedIn'
              />
            </div>

            {/* Contenu */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Contenu
              </label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className='w-full border border-gray-300 rounded-lg px-3 py-2'
                placeholder='Contenu du post LinkedIn...'
              />
            </div>

            {/* Programmation */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Statut
              </label>
              <select
                value={newPost.status}
                onChange={(e) => setNewPost(prev => ({ ...prev, status: e.target.value as any }))}
                className='w-full border border-gray-300 rounded-lg px-3 py-2'
              >
                <option value='draft'>Brouillon</option>
                <option value='scheduled'>Programmé</option>
              </select>
            </div>

            {newPost.status === 'scheduled' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Date et heure de publication
                </label>
                <input
                  type='datetime-local'
                  value={newPost.scheduledAt}
                  onChange={(e) => setNewPost(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className='w-full border border-gray-300 rounded-lg px-3 py-2'
                />
              </div>
            )}

            <button
              onClick={handleCreatePost}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'
            >
              Créer le post
            </button>
          </div>
        </div>

        {/* Liste des posts */}
        <div className='bg-white rounded-lg shadow'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-semibold'>Posts LinkedIn</h2>
          </div>
          
          {loading ? (
            <div className='p-6 text-center text-gray-500'>Chargement...</div>
          ) : linkedinPosts.length === 0 ? (
            <div className='p-6 text-center text-gray-500'>Aucun post LinkedIn</div>
          ) : (
            <div className='divide-y divide-gray-200'>
              {linkedinPosts.map(post => (
                <div key={post.id} className='p-6'>
                  <div className='flex justify-between items-start mb-4'>
                    <div>
                      <h3 className='text-lg font-medium text-gray-900'>{post.title}</h3>
                      <p className='text-sm text-gray-500 mt-1'>
                        {new Date(post.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published' ? 'bg-green-100 text-green-800' :
                        post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        post.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status === 'published' ? 'Publié' :
                         post.status === 'scheduled' ? 'Programmé' :
                         post.status === 'failed' ? 'Échoué' : 'Brouillon'}
                      </span>
                      
                      {post.status === 'draft' && linkedinConfig.isConnected && (
                        <button
                          onClick={() => handlePublishNow(post.id)}
                          className='text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700'
                        >
                          Publier maintenant
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className='text-sm text-red-600 hover:text-red-800'
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  
                  <p className='text-gray-700 mb-4'>{post.content}</p>
                  
                  {post.scheduled_at && (
                    <p className='text-sm text-gray-500'>
                      Programmé pour : {new Date(post.scheduled_at).toLocaleString('fr-FR')}
                    </p>
                  )}
                  
                  {post.published_at && (
                    <p className='text-sm text-green-600'>
                      Publié le : {new Date(post.published_at).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
