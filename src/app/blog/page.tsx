'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  read_time: number;
  published_at: string;
  image_url?: string;
}

export default function BlogPage() {
  const session = useSession();
  const user = useUser();
  const router = useRouter();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    // Récupérer la session directement depuis Supabase
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log('Session récupérée:', currentSession);
      
      if (currentSession?.user) {
        console.log('Utilisateur trouvé:', currentSession.user);
        setCurrentUser(currentSession.user);
        fetchUserRole(currentSession.user.id);
      } else {
        console.log('Pas de session utilisateur');
        setCurrentUser(null);
        setUserRole(null);
      }
    };
    
    getSession();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('=== DEBUG FETCH ROLE ===');
      console.log('User ID:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      console.log('Résultat requête:', { data, error });

      if (error) {
        console.error('Erreur lors du chargement du rôle:', error);
        return;
      }

      console.log('Rôle trouvé:', data?.role);
      setUserRole(data?.role);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

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

  const filteredArticles = categoryFilter === 'all' 
    ? articles 
    : articles.filter(article => article.category === categoryFilter);

  const categories = [
    { value: 'all', label: 'Tous les articles' },
    { value: 'product', label: 'Product' },
    { value: 'resources', label: 'Resources' },
    { value: 'community', label: 'Community' },
    { value: 'examples', label: 'Examples' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditArticle = (article: BlogArticle) => {
    router.push(`/admin/blog?edit=${article.id}`);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        const { error } = await supabase
          .from('blog_articles')
          .delete()
          .eq('id', articleId);

        if (error) {
          console.error('Erreur lors de la suppression:', error);
          return;
        }

        // Recharger les articles
        fetchArticles();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Blog IAHome
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez nos articles sur l'intelligence artificielle, les outils, les ressources et les meilleures pratiques.
              </p>
            </div>
                         <div className="flex-1 flex justify-end">
             </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === category.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image de l'article */}
              {article.image_url && (
                <div className="w-full h-48 relative overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {article.read_time} min de lecture
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  <Link 
                    href={`/blog/${article.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {article.title}
                  </Link>
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {article.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {article.author}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(article.published_at)}
                      </p>
                    </div>
                  </div>

                                     <div className="flex items-center gap-2">
                     <Link
                       href={`/blog/${article.slug}`}
                       className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                     >
                       Lire l'article →
                     </Link>
                     
                     {currentUser && userRole === 'admin' && (
                       <div className="flex gap-1 ml-2">
                         <button
                           onClick={() => handleEditArticle(article)}
                           className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                           title="Modifier"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                           </svg>
                         </button>
                         <button
                           onClick={() => handleDeleteArticle(article.id)}
                           className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                           title="Supprimer"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                           </svg>
                         </button>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </article>
          ))}
        </div>

                 {filteredArticles.length === 0 && (
           <div className="text-center py-12">
             <p className="text-gray-500 text-lg">
               Aucun article trouvé pour cette catégorie.
             </p>
           </div>
         )}

         {/* Articles recommandés */}
         {filteredArticles.length > 0 && (
           <div className="mt-16">
             <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">
                 Découvrez d'autres articles
               </h2>
               <p className="text-gray-600">
                 Continuez votre exploration de l'intelligence artificielle
               </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {articles.slice(0, 4).map((article) => (
                 <article
                   key={article.id}
                   className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                 >
                   {/* Image de l'article */}
                   {article.image_url && (
                     <div className="w-full h-32 relative overflow-hidden">
                       <img
                         src={article.image_url}
                         alt={article.title}
                         className="w-full h-full object-cover"
                       />
                     </div>
                   )}
                   
                   <div className="p-4">
                     <div className="flex items-center mb-2">
                       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                         {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                       </span>
                       <span className="ml-2 text-xs text-gray-500">
                         {article.read_time} min
                       </span>
                     </div>

                     <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                       <Link 
                         href={`/blog/${article.slug}`}
                         className="hover:text-blue-600 transition-colors"
                       >
                         {article.title}
                       </Link>
                     </h3>

                     <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                       {article.excerpt}
                     </p>

                     <div className="flex items-center justify-between">
                       <div className="flex items-center">
                         <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                           <span className="text-xs font-medium text-gray-700">
                             {article.author.split(' ').map(n => n[0]).join('')}
                           </span>
                         </div>
                         <div className="ml-2">
                           <p className="text-xs font-medium text-gray-900">
                             {article.author}
                           </p>
                         </div>
                       </div>

                       <Link
                         href={`/blog/${article.slug}`}
                         className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                       >
                         Lire →
                       </Link>
                     </div>
                   </div>
                 </article>
               ))}
             </div>

             <div className="text-center mt-8">
               <Link
                 href="/blog"
                 className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
               >
                 Voir tous les articles
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                 </svg>
               </Link>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 } 