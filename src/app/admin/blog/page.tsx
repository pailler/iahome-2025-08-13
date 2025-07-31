'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  read_time: number;
  published_at: string;
  image_url?: string;
}

export default function AdminBlogPage() {
  const session = useSession();
  const user = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'resources',
    author: '',
    read_time: 5,
    image_url: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (session && user) {
        console.log('Chargement du rôle pour:', user.email, 'ID:', user.id);
        
        try {
          // Essayer d'abord de récupérer depuis auth.users (plus fiable)
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError) {
            console.warn('Erreur lors du chargement depuis auth:', authError);
            setRole('user'); // Rôle par défaut
          } else {
            const userRole = authData.user?.user_metadata?.role || 'user';
            console.log('Rôle récupéré depuis auth.users:', userRole);
            setRole(userRole);
          }
        } catch (err) {
          console.error('Erreur inattendue lors du chargement du rôle:', err);
          setRole('user'); // Rôle par défaut
        }
      } else {
        console.log('Pas de session ou utilisateur:', { session: !!session, user: !!user });
        setRole(null);
      }
    };
    
    fetchUserRole();
  }, [session, user]);

  useEffect(() => {
    if (role === 'admin') {
      fetchArticles();
    }
  }, [role]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des articles:', error);
        return;
      }

      setArticles(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingArticle) {
        // Mise à jour d'un article existant
        const { error } = await supabase
          .from('blog_articles')
          .update({
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            excerpt: formData.excerpt,
            category: formData.category,
            author: formData.author,
            read_time: formData.read_time,
            image_url: formData.image_url || null
          })
          .eq('id', editingArticle.id);

        if (error) {
          console.error('Erreur lors de la mise à jour:', error);
          setMessage('Erreur lors de la mise à jour de l\'article');
          return;
        }
        
        setMessage('Article mis à jour avec succès !');
      } else {
        // Création d'un nouvel article
        const { error } = await supabase
          .from('blog_articles')
          .insert({
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            excerpt: formData.excerpt,
            category: formData.category,
            author: formData.author,
            read_time: formData.read_time,
            image_url: formData.image_url || null,
            published_at: new Date().toISOString()
          });

        if (error) {
          console.error('Erreur lors de la création:', error);
          setMessage('Erreur lors de la création de l\'article');
          return;
        }
        
        setMessage('Article créé avec succès !');
      }

      // Réinitialiser le formulaire et rafraîchir la liste
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category: 'resources',
        author: '',
        read_time: 5,
        image_url: ''
      });
      setEditingArticle(null);
      setShowForm(false);
      fetchArticles();
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Une erreur est survenue');
    }
  };

  const handleEdit = (article: BlogArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      author: article.author,
      read_time: article.read_time,
      image_url: article.image_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        setMessage('Erreur lors de la suppression de l\'article');
        return;
      }

      setMessage('Article supprimé avec succès !');
      fetchArticles();
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Une erreur est survenue');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category: 'resources',
      author: '',
      read_time: 5,
      image_url: ''
    });
  };

  // Vérification des droits d'accès
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Accès refusé
            </h1>
            <p className="text-gray-600 mb-8">
              Vous devez être connecté pour accéder à cette page.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Accès refusé
            </h1>
            <p className="text-gray-600 mb-8">
              Vous devez avoir les droits d'administrateur pour accéder à cette page.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Administration du Blog
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez les articles de votre blog
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Retour à l'admin
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un article
              </button>
            </div>
          </div>
        </div>

        {/* Barre d'actions rapides */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {articles.length} article{articles.length !== 1 ? 's' : ''} au total
              </span>
              {articles.length > 0 && (
                <span className="text-sm text-gray-600">
                  Dernier article : {new Date(articles[0]?.published_at).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvel article
              </button>
              <Link
                href="/blog"
                target="_blank"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Voir le blog
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('succès') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center">
              {message.includes('succès') ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {message}
            </div>
          </div>
        )}

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="titre-article"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extrait *
                </label>
                <textarea
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="resources">Resources</option>
                    <option value="community">Community</option>
                    <option value="pricing">Pricing</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="product">Product</option>
                    <option value="examples">Examples</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auteur *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temps de lecture (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu HTML *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="<h2>Titre de section</h2><p>Contenu de l'article...</p>"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingArticle ? 'Mettre à jour' : 'Créer l\'article'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des articles */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Articles ({articles.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{article.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {article.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.published_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/blog/${article.slug}`}
                          target="_blank"
                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Voir
                        </Link>
                        <button
                          onClick={() => handleEdit(article)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
    </div>
  );
} 