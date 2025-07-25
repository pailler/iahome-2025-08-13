'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function BlogArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    }
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('slug', articleSlug)
        .single();

      if (error) {
        console.error('Erreur lors du chargement de l\'article:', error);
        setError('Article non trouvé');
        return;
      }

      setArticle(data);
      
      // Charger les articles recommandés (même catégorie, excluant l'article actuel)
      fetchRelatedArticles(data.category, data.id);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (category: string, currentArticleId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('category', category)
        .neq('id', currentArticleId)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Erreur lors du chargement des articles recommandés:', error);
        return;
      }

      setRelatedArticles(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de l'article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Article non trouvé
            </h1>
            <p className="text-gray-600 mb-8">
              L'article que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Retour au blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                 <nav className="mb-8">
           <Link
             href="/"
             className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
           >
             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
             IAHome
           </Link>
         </nav>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image de l'article */}
          {article.image_url && (
            <div className="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <header className="mb-8">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </span>
                <span className="ml-3 text-sm text-gray-500">
                  {article.read_time} min de lecture
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>

              <p className="text-xl text-gray-600 mb-6">
                {article.excerpt}
              </p>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-700">
                    {article.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">
                    {article.author}
                  </p>
                  <p className="text-gray-500">
                    {formatDate(article.published_at)}
                  </p>
                </div>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed article-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.75',
                  color: '#374151'
                }}
              />
            </div>

            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Catégorie: {article.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    Temps de lecture: {article.read_time} min
                  </span>
                </div>
                
                <Link
                  href="/blog"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Voir tous les articles →
                </Link>
              </div>
            </footer>
          </div>
        </article>

        {/* Bannière d'articles recommandés */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
                         <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">
                 Articles similaires
               </h2>
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <article
                  key={relatedArticle.id}
                  className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Image de l'article */}
                  {relatedArticle.image_url && (
                    <div className="w-full h-40 relative overflow-hidden">
                      <img
                        src={relatedArticle.image_url}
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {relatedArticle.category.charAt(0).toUpperCase() + relatedArticle.category.slice(1)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {relatedArticle.read_time} min
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                      <Link 
                        href={`/blog/${relatedArticle.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {relatedArticle.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {relatedArticle.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {relatedArticle.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs font-medium text-gray-900">
                            {relatedArticle.author}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${relatedArticle.slug}`}
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