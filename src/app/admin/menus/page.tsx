'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { MenuService, Menu, MenuItem, Page } from '../../../utils/menuService';
import Header from '../../../components/Header';
import Breadcrumb from '../../../components/Breadcrumb';

interface MenuWithItems extends Menu {
  items: MenuItem[];
}

export default function MenusAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour les données
  const [menus, setMenus] = useState<MenuWithItems[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [activeTab, setActiveTab] = useState<'menus' | 'pages'>('menus');
  
  // États pour les formulaires
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [showPageForm, setShowPageForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  // États pour les formulaires
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    is_active: true,
    position: 0
  });

  const [menuItemForm, setMenuItemForm] = useState({
    menu_id: '',
    parent_id: null as string | null,
    title: '',
    url: '',
    page_id: null as string | null,
    icon: '',
    position: 0,
    is_active: true,
    is_external: false,
    target: '_self',
    requires_auth: false,
    roles_allowed: [] as string[]
  });

  const [pageForm, setPageForm] = useState({
    slug: '',
    title: '',
    description: '',
    content: '',
    is_published: true,
    is_homepage: false,
    meta_title: '',
    meta_description: ''
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
        fetchData();
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la vérification admin:', err);
      setIsAdmin(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Charger les menus avec leurs éléments
      const allMenus = await MenuService.getMenus();
      const menusWithItems = await Promise.all(
        allMenus.map(async (menu) => {
          const items = await MenuService.getMenuItems(menu.name);
          return { ...menu, items };
        })
      );
      setMenus(menusWithItems);

      // Charger les pages
      const allPages = await MenuService.getPages();
      setPages(allPages);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await MenuService.updateMenu(editingMenu.id, menuForm);
      } else {
        await MenuService.createMenu(menuForm);
      }
      setShowMenuForm(false);
      setEditingMenu(null);
      setMenuForm({ name: '', description: '', is_active: true, position: 0 });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du menu:', error);
    }
  };

  const handleMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMenuItem) {
        await MenuService.updateMenuItem(editingMenuItem.id, menuItemForm);
      } else {
        await MenuService.createMenuItem(menuItemForm);
      }
      setShowMenuItemForm(false);
      setEditingMenuItem(null);
      setMenuItemForm({
        menu_id: '',
        parent_id: null,
        title: '',
        url: '',
        page_id: null,
        icon: '',
        position: 0,
        is_active: true,
        is_external: false,
        target: '_self',
        requires_auth: false,
        roles_allowed: []
      });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'élément de menu:', error);
    }
  };

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPage) {
        await MenuService.updatePage(editingPage.id, pageForm);
      } else {
        await MenuService.createPage(pageForm);
      }
      setShowPageForm(false);
      setEditingPage(null);
      setPageForm({
        slug: '',
        title: '',
        description: '',
        content: '',
        is_published: true,
        is_homepage: false,
        meta_title: '',
        meta_description: ''
      });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la page:', error);
    }
  };

  const deleteMenu = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
      try {
        await MenuService.deleteMenu(id);
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression du menu:', error);
      }
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément de menu ?')) {
      try {
        await MenuService.deleteMenuItem(id);
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'élément de menu:', error);
      }
    }
  };

  const deletePage = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      try {
        await MenuService.deletePage(id);
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression de la page:', error);
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Gestion des menus', href: '/admin/menus' }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des menus</h1>
          <p className="text-gray-600">Gérez les menus et les pages de votre site web</p>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('menus')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'menus'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Menus ({menus.length})
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pages ({pages.length})
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <>
            {activeTab === 'menus' && (
              <div className="space-y-6">
                {/* Bouton pour ajouter un menu */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Menus</h2>
                  <button
                    onClick={() => setShowMenuForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter un menu
                  </button>
                </div>

                {/* Liste des menus */}
                <div className="bg-white rounded-lg shadow">
                  {menus.map((menu) => (
                    <div key={menu.id} className="border-b border-gray-200 last:border-b-0">
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{menu.name}</h3>
                            <p className="text-gray-600 mt-1">{menu.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Position: {menu.position}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                menu.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {menu.is_active ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingMenu(menu);
                                setMenuForm({
                                  name: menu.name,
                                  description: menu.description || '',
                                  is_active: menu.is_active,
                                  position: menu.position
                                });
                                setShowMenuForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => deleteMenu(menu.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>

                        {/* Éléments du menu */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-md font-medium text-gray-900">Éléments du menu</h4>
                            <button
                              onClick={() => {
                                setMenuItemForm({ ...menuItemForm, menu_id: menu.id });
                                setShowMenuItemForm(true);
                              }}
                              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              Ajouter un élément
                            </button>
                          </div>
                          
                          {menu.items.length > 0 ? (
                            <div className="space-y-2">
                              {menu.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                  <div>
                                    <span className="font-medium">{item.title}</span>
                                    {item.url && <span className="text-gray-500 ml-2">→ {item.url}</span>}
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        setEditingMenuItem(item);
                                        setMenuItemForm({
                                          menu_id: item.menu_id,
                                          parent_id: item.parent_id,
                                          title: item.title,
                                          url: item.url || '',
                                          page_id: item.page_id,
                                          icon: item.icon || '',
                                          position: item.position,
                                          is_active: item.is_active,
                                          is_external: item.is_external,
                                          target: item.target,
                                          requires_auth: item.requires_auth,
                                          roles_allowed: item.roles_allowed || []
                                        });
                                        setShowMenuItemForm(true);
                                      }}
                                      className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                      Modifier
                                    </button>
                                    <button
                                      onClick={() => deleteMenuItem(item.id)}
                                      className="text-sm text-red-600 hover:text-red-800"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Aucun élément dans ce menu</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'pages' && (
              <div className="space-y-6">
                {/* Informations sur les pages migrées */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Pages migrées automatiquement
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Les pages statiques du site ont été migrées dans cette base de données. Vous pouvez :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Modifier le contenu et les meta tags des pages existantes</li>
                          <li>Associer ces pages aux éléments de menu</li>
                          <li>Créer de nouvelles pages personnalisées</li>
                          <li>Gérer la publication et l'ordre des pages</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bouton pour ajouter une page */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Pages</h2>
                  <button
                    onClick={() => setShowPageForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter une page
                  </button>
                </div>

                {/* Liste des pages */}
                <div className="bg-white rounded-lg shadow">
                  {pages.map((page) => (
                    <div key={page.id} className="border-b border-gray-200 last:border-b-0 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{page.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              page.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {page.is_published ? 'Publiée' : 'Brouillon'}
                            </span>
                            {page.is_homepage && (
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                Page d'accueil
                              </span>
                            )}
                          </div>
                          
                          {/* Informations de base */}
                          <div className="text-sm text-gray-600 mb-3">
                            <p><strong>Slug:</strong> /{page.slug}</p>
                            {page.description && (
                              <p className="mt-1"><strong>Description:</strong> {page.description}</p>
                            )}
                          </div>

                          {/* Meta tags */}
                          {(page.meta_title || page.meta_description) && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Meta tags</h4>
                              {page.meta_title && (
                                <p className="text-xs text-gray-600 mb-1">
                                  <strong>Title:</strong> {page.meta_title}
                                </p>
                              )}
                              {page.meta_description && (
                                <p className="text-xs text-gray-600">
                                  <strong>Description:</strong> {page.meta_description}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Aperçu du contenu HTML */}
                          {page.content && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu du contenu HTML</h4>
                              <div className="text-xs text-gray-600 bg-white p-2 rounded border max-h-20 overflow-hidden">
                                {page.content.length > 200 
                                  ? page.content.substring(0, 200) + '...' 
                                  : page.content
                                }
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {page.content.length} caractères
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingPage(page);
                              setPageForm({
                                slug: page.slug,
                                title: page.title,
                                description: page.description || '',
                                content: page.content || '',
                                is_published: page.is_published,
                                is_homepage: page.is_homepage,
                                meta_title: page.meta_title || '',
                                meta_description: page.meta_description || ''
                              });
                              setShowPageForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => deletePage(page.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal pour le formulaire de menu */}
        {showMenuForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">
                {editingMenu ? 'Modifier le menu' : 'Ajouter un menu'}
              </h3>
              <form onSubmit={handleMenuSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="number"
                    value={menuForm.position}
                    onChange={(e) => setMenuForm({ ...menuForm, position: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={menuForm.is_active}
                    onChange={(e) => setMenuForm({ ...menuForm, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Menu actif</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuForm(false);
                      setEditingMenu(null);
                      setMenuForm({ name: '', description: '', is_active: true, position: 0 });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingMenu ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour le formulaire d'élément de menu */}
        {showMenuItemForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">
                {editingMenuItem ? 'Modifier l\'élément' : 'Ajouter un élément'}
              </h3>
              <form onSubmit={handleMenuItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <input
                    type="text"
                    value={menuItemForm.title}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Page associée (optionnel)</label>
                  <select
                    value={menuItemForm.page_id || ''}
                    onChange={(e) => {
                      const pageId = e.target.value || null;
                      const selectedPage = pages.find(p => p.id === pageId);
                      setMenuItemForm({ 
                        ...menuItemForm, 
                        page_id: pageId,
                        url: selectedPage ? `/${selectedPage.slug}` : menuItemForm.url
                      });
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">-- Sélectionner une page --</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title} (/{page.slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL personnalisée</label>
                  <input
                    type="text"
                    value={menuItemForm.url}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, url: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="/page"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide si vous avez sélectionné une page ci-dessus
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Icône (optionnel)</label>
                  <input
                    type="text"
                    value={menuItemForm.icon}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, icon: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="🏠"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="number"
                    value={menuItemForm.position}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, position: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={menuItemForm.is_active}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Élément actif</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={menuItemForm.is_external}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, is_external: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Lien externe</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={menuItemForm.requires_auth}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, requires_auth: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Nécessite une authentification</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuItemForm(false);
                      setEditingMenuItem(null);
                      setMenuItemForm({
                        menu_id: '',
                        parent_id: null,
                        title: '',
                        url: '',
                        page_id: null,
                        icon: '',
                        position: 0,
                        is_active: true,
                        is_external: false,
                        target: '_self',
                        requires_auth: false,
                        roles_allowed: []
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingMenuItem ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour le formulaire de page */}
        {showPageForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">
                {editingPage ? 'Modifier la page' : 'Ajouter une page'}
              </h3>
              <form onSubmit={handlePageSubmit} className="space-y-4">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input
                      type="text"
                      value={pageForm.slug}
                      onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="exemple-page"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">URL de la page (ex: /exemple-page)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre</label>
                    <input
                      type="text"
                      value={pageForm.title}
                      onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Titre de la page"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description (HTML autorisé)
                  </label>
                  <textarea
                    value={pageForm.description}
                    onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                    rows={4}
                    placeholder="Description de la page... (HTML autorisé)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Vous pouvez utiliser du HTML pour formater la description (gras, italique, liens, etc.)
                  </p>
                </div>

                {/* Contenu HTML */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contenu HTML de la page
                  </label>
                  <textarea
                    value={pageForm.content}
                    onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                    rows={12}
                    placeholder="<h1>Titre principal</h1>&#10;<p>Contenu de votre page...</p>"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Saisissez le contenu HTML complet de votre page. Utilisez des balises HTML pour la mise en forme.
                  </p>
                </div>

                {/* Meta tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                    <input
                      type="text"
                      value={pageForm.meta_title}
                      onChange={(e) => setPageForm({ ...pageForm, meta_title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Titre pour les moteurs de recherche"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                    <input
                      type="text"
                      value={pageForm.meta_description}
                      onChange={(e) => setPageForm({ ...pageForm, meta_description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Description pour les moteurs de recherche"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pageForm.is_published}
                      onChange={(e) => setPageForm({ ...pageForm, is_published: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Page publiée</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pageForm.is_homepage}
                      onChange={(e) => setPageForm({ ...pageForm, is_homepage: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Page d'accueil</label>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPageForm(false);
                      setEditingPage(null);
                      setPageForm({
                        slug: '',
                        title: '',
                        description: '',
                        content: '',
                        is_published: true,
                        is_homepage: false,
                        meta_title: '',
                        meta_description: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingPage ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 