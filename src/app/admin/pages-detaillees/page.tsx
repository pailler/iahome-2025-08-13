'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Card {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  youtube_url?: string;
  created_at?: string;
}

interface DetailPage {
  id: string;
  card_id: string;
  title: string;
  content: string;
  meta_description?: string;
  slug: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  card?: Card;
}

export default function AdminPagesDetailleesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [detailPages, setDetailPages] = useState<DetailPage[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<DetailPage | null>(null);
  const [isAddingPage, setIsAddingPage] = useState(false);

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
      console.log('🔍 Vérification du statut admin pour:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('❌ Erreur lors de la vérification admin:', error);
        setIsAdmin(false);
        return;
      }
      const userIsAdmin = data?.role === 'admin';
      console.log('✅ Statut admin:', userIsAdmin, 'Role:', data?.role);
      setIsAdmin(userIsAdmin);
      if (userIsAdmin) {
        fetchData();
      }
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la vérification admin:', err);
      setIsAdmin(false);
    }
  };

  const fetchData = async () => {
    try {
      // Charger les cartes
      const { data: cardsData, error: cardsError } = await supabase
        .from('cartes')
        .select('*')
        .order('title');

      if (!cardsError && cardsData) {
        setCards(cardsData);
      }

      // Charger les pages détaillées avec les données des cartes
      const { data: pagesData, error: pagesError } = await supabase
        .from('detail_pages')
        .select(`
          *,
          card:cartes(*)
        `)
        .order('created_at', { ascending: false });

      if (!pagesError && pagesData) {
        setDetailPages(pagesData);
      }

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPage = (page: DetailPage) => {
    setEditingPage(page);
    setIsAddingPage(false);
    setShowModal(true);
  };

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page détaillée ?')) {
      try {
        const { error } = await supabase
          .from('detail_pages')
          .delete()
          .eq('id', pageId);
        
        if (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de la page');
        } else {
          fetchData();
          alert('Page supprimée avec succès');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleAddPage = () => {
    setEditingPage(null);
    setIsAddingPage(true);
    setShowModal(true);
  };

  const handleSavePage = async (pageData: any) => {
    try {
      if (!pageData.title || !pageData.content || !pageData.card_id) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Générer un slug à partir du titre
      const slug = pageData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      if (isAddingPage) {
        const { error } = await supabase
          .from('detail_pages')
          .insert([{
            ...pageData,
            slug,
            is_published: pageData.is_published || false
          }]);
        
        if (error) {
          console.error('Erreur lors de l\'ajout:', error);
          alert(`Erreur lors de l'ajout de la page: ${error.message}`);
          return;
        } else {
          alert('Page ajoutée avec succès');
        }
      } else {
        const { error } = await supabase
          .from('detail_pages')
          .update({
            ...pageData,
            slug,
            is_published: pageData.is_published || false
          })
          .eq('id', editingPage!.id);
        
        if (error) {
          console.error('Erreur lors de la modification:', error);
          alert(`Erreur lors de la modification de la page: ${error.message}`);
          return;
        } else {
          alert('Page modifiée avec succès');
        }
      }
      
      fetchData();
      setShowModal(false);
      setEditingPage(null);
      setIsAddingPage(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const togglePublishStatus = async (pageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('detail_pages')
        .update({ is_published: !currentStatus })
        .eq('id', pageId);
      
      if (error) {
        console.error('Erreur lors du changement de statut:', error);
        alert('Erreur lors du changement de statut');
      } else {
        fetchData();
        alert(`Page ${!currentStatus ? 'publiée' : 'dépubliée'} avec succès`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  // Contrôles d'accès
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
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
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez avoir les droits d'administrateur pour accéder à cette page.</p>
                               <Link href="https://home.regispailler.fr/admin/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Retour à l'administration</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Pages Détaillées</h1>
              <p className="text-gray-600 mt-2">Gérez les pages détaillées liées aux cartes</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Retour à l'administration
              </Link>
              <button
                onClick={handleAddPage}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Créer une page
              </button>
            </div>
          </div>
        </div>

        {/* Liste des pages détaillées */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Chargement des pages détaillées...</div>
          </div>
        ) : detailPages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Aucune page détaillée trouvée</div>
            <button
              onClick={handleAddPage}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Créer la première page
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {detailPages.map((page) => (
              <div key={page.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${
                      page.is_published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {page.is_published ? 'PUBLIÉE' : 'BROUILLON'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => togglePublishStatus(page.id, page.is_published)}
                        className={`p-1 transition-colors ${
                          page.is_published 
                            ? 'text-green-600 hover:text-yellow-600' 
                            : 'text-yellow-600 hover:text-green-600'
                        }`}
                        title={page.is_published ? 'Dépublier' : 'Publier'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditPage(page)}
                        className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Modifier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{page.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{page.content.substring(0, 150)}...</p>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      <strong>Carte liée:</strong> {page.card?.title || 'Carte non trouvée'}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Slug:</strong> {page.slug}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>ID:</strong> {page.id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal d'édition/ajout */}
        {showModal && (
          <DetailPageModal 
            page={editingPage}
            cards={cards}
            isAdding={isAddingPage}
            onSave={handleSavePage}
            onClose={() => {
              setShowModal(false);
              setEditingPage(null);
              setIsAddingPage(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Composant modal pour l'édition/ajout de pages détaillées
function DetailPageModal({ page, cards, isAdding, onSave, onClose }: {
  page: DetailPage | null;
  cards: Card[];
  isAdding: boolean;
  onSave: (pageData: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: page?.title || '',
    content: page?.content || '',
    card_id: page?.card_id || '',
    meta_description: page?.meta_description || '',
    is_published: page?.is_published || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isAdding ? 'Créer une page détaillée' : 'Modifier la page'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de la page *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Titre de la page détaillée"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carte associée *
              </label>
              <select
                required
                value={formData.card_id}
                onChange={(e) => setFormData({...formData, card_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une carte</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.title} - {card.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu de la page *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
                placeholder="Contenu détaillé de la page..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description meta (optionnel)
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description pour le SEO..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                Publier immédiatement
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isAdding ? 'Créer' : 'Modifier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 