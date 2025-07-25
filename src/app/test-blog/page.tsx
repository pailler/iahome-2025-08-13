'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import Link from "next/link";

export default function TestBlogPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results: any = {};

    try {
      // Test 1: Configuration Supabase
      results.config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configuré' : '❌ Manquant',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configuré' : '❌ Manquant',
        client: supabase ? '✅ Client créé' : '❌ Client manquant'
      };

      // Test 2: Vérifier si la table blog_articles existe
      const { data: tableCheck, error: tableError } = await supabase
        .from('blog_articles')
        .select('count')
        .limit(1);

      results.tableExists = tableError ? 
        { status: '❌ Erreur', error: tableError.message } : 
        { status: '✅ Table existe', data: tableCheck };

      // Test 3: Compter les articles
      const { count, error: countError } = await supabase
        .from('blog_articles')
        .select('*', { count: 'exact', head: true });

      results.articleCount = countError ? 
        { status: '❌ Erreur', error: countError.message } : 
        { status: '✅ Succès', count: count };

      // Test 4: Récupérer tous les articles
      const { data: articles, error: articlesError } = await supabase
        .from('blog_articles')
        .select('*')
        .order('published_at', { ascending: false });

      results.articles = articlesError ? 
        { status: '❌ Erreur', error: articlesError.message } : 
        { status: '✅ Succès', count: articles?.length || 0, data: articles };

    } catch (error) {
      results.generalError = error;
    }

    setTestResults(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Test de la connexion blog...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test de connexion Blog - Base de données
        </h1>

        <div className="space-y-6">
          {/* Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configuration Supabase
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>URL Supabase:</span>
                <span className={testResults.config?.url?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.config?.url}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Clé anonyme:</span>
                <span className={testResults.config?.anonKey?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.config?.anonKey}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Client Supabase:</span>
                <span className={testResults.config?.client?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.config?.client}
                </span>
              </div>
            </div>
          </div>

          {/* Test de la table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test de la table blog_articles
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Existence de la table:</span>
                <span className={testResults.tableExists?.status?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.tableExists?.status}
                </span>
              </div>
              {testResults.tableExists?.error && (
                <div className="text-red-600 text-sm">
                  Erreur: {testResults.tableExists.error}
                </div>
              )}
            </div>
          </div>

          {/* Nombre d'articles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Nombre d'articles
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Articles trouvés:</span>
                <span className={testResults.articleCount?.status?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.articleCount?.status === '✅ Succès' ? testResults.articleCount.count : testResults.articleCount?.status}
                </span>
              </div>
              {testResults.articleCount?.error && (
                <div className="text-red-600 text-sm">
                  Erreur: {testResults.articleCount.error}
                </div>
              )}
            </div>
          </div>

          {/* Articles récupérés */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Articles récupérés
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Récupération:</span>
                <span className={testResults.articles?.status?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {testResults.articles?.status}
                </span>
              </div>
              {testResults.articles?.error && (
                <div className="text-red-600 text-sm">
                  Erreur: {testResults.articles.error}
                </div>
              )}
              {testResults.articles?.data && testResults.articles.data.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Articles disponibles:</h3>
                  <div className="space-y-2">
                    {testResults.articles.data.map((article: any, index: number) => (
                      <div key={article.id} className="border-l-4 border-blue-500 pl-3">
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-gray-600">
                          Slug: {article.slug} | Catégorie: {article.category} | Auteur: {article.author}
                        </div>
                        <div className="text-xs text-gray-500">
                          Contenu: {article.content?.substring(0, 100)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Actions
            </h2>
            <div className="flex gap-4">
              <button
                onClick={runTests}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Relancer les tests
              </button>
              <Link
                href="/blog"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Aller au blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}