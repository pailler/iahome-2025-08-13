'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  youtube_url?: string;
  created_at?: string;
  updated_at?: string;
  // Champs pour la page détaillée intégrée
  detail_title?: string;
  detail_content?: string;
  detail_meta_description?: string;
  detail_slug?: string;
  detail_is_published?: boolean;
}

export default function AdminModulesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);

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
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la vérification admin:', err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      console.log('🚀 Chargement des modules car utilisateur est admin');
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      console.log('📡 Tentative de chargement des données depuis Supabase...');
      
      // Charger les modules (sans les pages détaillées pour l'instant)
      const { data: modulesData, error: modulesError } = await supabase
        .from('cartes')
        .select('*')
        .order('title', { ascending: true });

      if (modulesError) {
        console.error('❌ Erreur lors du chargement des modules:', modulesError);
      } else {
        console.log('✅ Modules chargés:', modulesData?.length || 0);
        
        // Transformer les données (sans pages détaillées pour l'instant)
        const transformedModules = modulesData?.map(module => ({
          ...module,
          detail_title: '', // Pas de pages détaillées pour l'instant
          detail_content: '',
          detail_meta_description: '',
          detail_slug: '',
          detail_is_published: false
        })) || [];
        
        setModules(transformedModules);
      }

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setIsAddingModule(false);
    setShowModal(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      try {
        // Supprimer le module directement
        const { error } = await supabase
          .from('cartes')
          .delete()
          .eq('id', moduleId);
        
        if (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du module');
        } else {
          fetchData();
          alert('Module supprimé avec succès');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleAddModule = () => {
    setEditingModule(null);
    setIsAddingModule(true);
    setShowModal(true);
  };

  const handleSaveModule = async (moduleData: any, detailPageData?: any) => {
    try {
      if (!moduleData.title || !moduleData.description || !moduleData.category) {
        alert('Veuillez remplir tous les champs obligatoires du module');
        return;
      }

      let moduleId: string;

      if (isAddingModule) {
        // Ajouter le module
        const { data: newModule, error: moduleError } = await supabase
          .from('cartes')
          .insert([moduleData])
          .select()
          .single();
        
        if (moduleError) {
          console.error('Erreur lors de l\'ajout du module:', moduleError);
          alert(`Erreur lors de l'ajout du module: ${moduleError.message}`);
          return;
        }
        
        moduleId = newModule.id;
        console.log('✅ Module ajouté avec ID:', moduleId);
      } else {
        // Modifier le module
        const { error: moduleError } = await supabase
          .from('cartes')
          .update(moduleData)
          .eq('id', editingModule!.id);
        
        if (moduleError) {
          console.error('Erreur lors de la modification du module:', moduleError);
          alert(`Erreur lors de la modification du module: ${moduleError.message}`);
          return;
        }
        
        moduleId = editingModule!.id;
        console.log('✅ Module modifié avec ID:', moduleId);
      }

      // Pour l'instant, on ne gère que les modules (pas les pages détaillées)
      // Les pages détaillées seront gérées plus tard quand la table sera créée

      fetchData();
      setShowModal(false);
      setEditingModule(null);
      setIsAddingModule(false);
      
      const action = isAddingModule ? 'ajouté' : 'modifié';
      alert(`Module ${action} avec succès`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Modules</h1>
              <p className="text-gray-600 mt-2">Gérez vos modules et leurs pages détaillées intégrées</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="https://home.regispailler.fr/admin/" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Retour à l'administration
              </Link>
              <button
                onClick={handleAddModule}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Ajouter un module
              </button>
            </div>
          </div>
        </div>

        {/* Liste des modules */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Chargement des modules...</div>
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Aucun module trouvé</div>
            <button
              onClick={handleAddModule}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Créer le premier module
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-block px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700">
                      {module.category}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditModule(module)}
                        className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Modifier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{module.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-500">
                      <strong>Prix:</strong> {module.price}€
                    </div>
                    {module.detail_title && (
                      <div className="text-sm text-gray-500">
                        <strong>Page détaillée:</strong> 
                        <span className={`ml-1 px-2 py-1 text-xs rounded ${
                          module.detail_is_published 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {module.detail_is_published ? 'Publiée' : 'Brouillon'}
                        </span>
                      </div>
                    )}
                  </div>

                  {module.detail_title && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Page détaillée intégrée:</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{module.detail_title}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal d'édition/ajout unifié */}
        {showModal && (
          <UnifiedModuleModal 
            module={editingModule}
            isAdding={isAddingModule}
            onSave={handleSaveModule}
            onClose={() => {
              setShowModal(false);
              setEditingModule(null);
              setIsAddingModule(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Composant modal unifié pour l'édition/ajout de modules
function UnifiedModuleModal({ module, isAdding, onSave, onClose }: {
  module: Module | null;
  isAdding: boolean;
  onSave: (moduleData: any, detailPageData?: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    // Champs du module
    title: module?.title || '',
    description: module?.description || '',
    category: module?.category || '',
    price: module?.price || 0,
    youtube_url: module?.youtube_url || '',
    // Champs de la page détaillée
    detail_title: module?.detail_title || '',
    detail_content: module?.detail_content || '',
    detail_meta_description: module?.detail_meta_description || '',
    detail_is_published: module?.detail_is_published || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Séparer les données pour le module et la page détaillée
    const moduleData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      youtube_url: formData.youtube_url
    };
    
    const detailPageData = {
      title: formData.detail_title,
      content: formData.detail_content,
      meta_description: formData.detail_meta_description,
      is_published: formData.detail_is_published
    };
    
    onSave(moduleData, detailPageData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isAdding ? 'Ajouter un module' : 'Modifier le module'}
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section Informations du module */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Informations du module</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du module *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre du module"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="IA ASSISTANT">IA ASSISTANT</option>
                    <option value="IA BUREAUTIQUE">IA BUREAUTIQUE</option>
                    <option value="IA PHOTO">IA PHOTO</option>
                    <option value="IA VIDEO">IA VIDEO</option>
                    <option value="IA MAO">IA MAO</option>
                    <option value="IA PROMPTS">IA PROMPTS</option>
                    <option value="IA MARKETING">IA MARKETING</option>
                    <option value="IA DESIGN">IA DESIGN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL YouTube (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description du module *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Description du module"
                  />
                </div>
              </div>
            </div>

            {/* Section Page détaillée */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-4">📄 Page détaillée (optionnel)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de la page détaillée
                  </label>
                  <input
                    type="text"
                    value={formData.detail_title}
                    onChange={(e) => setFormData({...formData, detail_title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre de la page détaillée"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu de la page
                  </label>
                  <textarea
                    value={formData.detail_content}
                    onChange={(e) => setFormData({...formData, detail_content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Contenu détaillé de la page... Vous pouvez utiliser le format Markdown pour la mise en forme."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Support Markdown: **gras**, *italique*, ## titres, - listes, etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description meta (SEO)
                  </label>
                  <textarea
                    value={formData.detail_meta_description}
                    onChange={(e) => setFormData({...formData, detail_meta_description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Description pour le SEO..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="detail_is_published"
                    checked={formData.detail_is_published}
                    onChange={(e) => setFormData({...formData, detail_is_published: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="detail_is_published" className="ml-2 block text-sm text-gray-900">
                    Publier immédiatement la page détaillée
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
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
                {isAdding ? 'Créer le module' : 'Modifier le module'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 