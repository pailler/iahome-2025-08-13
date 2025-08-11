'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

interface Page {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  is_published: boolean;
  is_homepage: boolean;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

export default function DynamicPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer la page par son slug
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Page non trouvée');
          } else {
            setError('Erreur lors du chargement de la page');
            console.error('Erreur fetchPage:', error);
          }
        } else {
          setPage(data);
        }
      } catch (err) {
        setError('Erreur lors du chargement de la page');
        console.error('Erreur fetchPage:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  // Mettre à jour les meta tags
  useEffect(() => {
    if (page) {
      // Mettre à jour le titre de la page
      document.title = page.meta_title || page.title;
      
      // Mettre à jour la meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', page.meta_description || page.description);
      } else {
        const newMetaDescription = document.createElement('meta');
        newMetaDescription.name = 'description';
        newMetaDescription.content = page.meta_description || page.description;
        document.head.appendChild(newMetaDescription);
      }
    }
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Page non trouvée</h1>
              <p className="text-gray-600 mb-8">
                La page que vous recherchez n'existe pas ou n'est pas publiée.
              </p>
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: page.title, href: `/${page.slug}` }
            ]} 
          />
        </div>
      </div>

      {/* Contenu de la page */}
      <main>
        {/* Titre de la page */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
            {page.description && (
              <p className="text-xl text-gray-600">{page.description}</p>
            )}
          </div>
        </div>

        {/* Contenu HTML */}
        {page.content && (
          <div className="bg-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </div>
        )}

        {/* Informations de la page */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                <span>Dernière mise à jour : </span>
                <span>{new Date(page.updated_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center space-x-4">
                {page.is_homepage && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    🏠 Page d'accueil
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  ✅ Publiée
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 