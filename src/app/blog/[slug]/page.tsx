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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_articles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Erreur lors du chargement de l\'article:', error);
          setError('Article non trouvé');
          return;
        }

        setArticle(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement de l\'article');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

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
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au blog
          </Link>
        </div>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image de l'article */}
          {article.image_url && (
            <div className="w-full h-64 md:h-96 relative overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            {/* En-tête de l'article */}
            <header className="mb-8">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </span>
                <span className="ml-3 text-sm text-gray-500">
                  {article.read_time} min de lecture
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {article.excerpt}
              </p>
              
              <div className="flex items-center text-sm text-gray-500">
                <span>Par {article.author}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(article.published_at)}</span>
              </div>
            </header>

            {/* Contenu de l'article */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

        {/* Navigation entre articles */}
        <div className="mt-12 flex justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tous les articles
          </Link>
          
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Articles récents
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}