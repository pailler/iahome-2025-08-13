'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { UnifiedModuleModal } from '../../../components/ModuleModals';

interface Module {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  categories?: string[]; // Nouvelles catégories multiples
  price: number;
  youtube_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface AccessToken {
  id: string;
  name: string;
  description: string;
  module_id: string;
  module_name: string;
  access_level: 'basic' | 'premium' | 'admin';
  permissions: string[];
  max_usage: number;
  current_usage: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at: string;
  jwt_token: string;
  last_used_at?: string;
  usage_log: any[];
}

interface TokenInfo {
  moduleName: string;
  baseUrl: string;
  accessUrl: string;
  permissions: string[];
  expiresIn: string;
  jwtSecret: string;
}

interface EditableTokenSettings {
  baseUrl: string;
  customUrl: string;
  permissions: string[];
  expiresIn: string;
  useCustomUrl: boolean;
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleTokens, setModuleTokens] = useState<{ [moduleId: string]: AccessToken[] }>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Récupérer la session utilisateur
    const getSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      setLoading(false);
    }
  };

  // Vérifier le statut administrateur
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du statut admin:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }; 

  // Charger les données
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des modules:', error);
      } else {
        setModules(data || []);
        // Charger les tokens pour chaque module
        await fetchModuleTokens(data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
    }
  };

  // Charger les tokens associés à chaque module
  const fetchModuleTokens = async (modulesList: Module[]) => {
    try {
      const tokensMap: { [moduleId: string]: AccessToken[] } = {};
      
      for (const module of modulesList) {
        const { data: tokens, error } = await supabase
          .from('access_tokens')
          .select('*')
          .eq('module_id', module.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Erreur lors du chargement des tokens pour le module ${module.title}:`, error);
          tokensMap[module.id] = [];
        } else {
          tokensMap[module.id] = tokens || [];
        }
      }

      setModuleTokens(tokensMap);
    } catch (error) {
      console.error('Erreur lors du chargement des tokens:', error);
    }
  };

  // Gérer l'édition d'un module
  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setIsAdding(false);
    setShowModal(true);
  };

  // Gérer la suppression d'un module
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      return;
    }

      try {
         const { error } = await supabase
           .from('modules')
           .delete()
           .eq('id', moduleId);
        
        if (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression du module');
        } else {
        setModules(modules.filter(m => m.id !== moduleId));
          alert('Module supprimé avec succès');
        }
      } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du module');
    }
  };

  // Gérer l'ajout d'un module
  const handleAddModule = () => {
    setEditingModule(null);
    setIsAdding(true);
    setShowModal(true);
  };

  // Gérer un module (mode gestion)
  const handleManageModule = (module: Module) => {
    setSelectedModule(module);
    setShowManageModal(true);
  };

  // Gérer la modification d'un token
  const handleEditToken = async (tokenId: string, updatedData: Partial<AccessToken>) => {
    try {
      const { error } = await supabase
        .from('access_tokens')
        .update(updatedData)
        .eq('id', tokenId);

      if (error) {
        console.error('Erreur lors de la modification du token:', error);
        alert('Erreur lors de la modification du token');
      } else {
        // Recharger les tokens pour le module
        await fetchModuleTokens(modules);
        alert('Token modifié avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du token:', error);
      alert('Erreur lors de la modification du token');
    }
  };

  // Gérer la suppression d'un token
  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce token ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('access_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) {
        console.error('Erreur lors de la suppression du token:', error);
        alert('Erreur lors de la suppression du token');
      } else {
        // Recharger les tokens pour le module
        await fetchModuleTokens(modules);
        alert('Token supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      alert('Erreur lors de la suppression du token');
    }
  }; 

  // Vérifier le statut du service
  const checkServiceStatus = async (moduleTitle: string) => {
    const moduleName = moduleTitle.toLowerCase().replace(/\s+/g, '');
    
    // Mapping des URLs des modules
    const moduleUrls: { [key: string]: string } = {
      'stablediffusion': 'https://stablediffusion.regispailler.fr',
      'iaphoto': 'https://iaphoto.regispailler.fr', 
      'iametube': 'https://metube.regispailler.fr',
      'chatgpt': 'https://chatgpt.regispailler.fr',
      'librespeed': 'https://librespeed.regispailler.fr',
      'psitransfer': 'https://psitransfer.regispailler.fr',
      'pdf+': 'https://pdfplus.regispailler.fr',
      'aiassistant': 'https://aiassistant.regispailler.fr',
      'cogstudio': 'https://cogstudio.regispailler.fr',
      'ruinedfooocus': 'https://ruinedfooocus.regispailler.fr',
      'invoke': 'https://invoke.regispailler.fr'
    };
    
    const baseUrl = moduleUrls[moduleName];
    
    if (!baseUrl) {
      alert('URL du service non trouvée pour ce module');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert(`✅ Service ${moduleTitle} est opérationnel`);
      } else {
        alert(`❌ Service ${moduleTitle} n'est pas accessible (${response.status})`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du service:', error);
      alert(`❌ Erreur lors de la vérification du service ${moduleTitle}`);
    }
  };

  // Sauvegarder un module
    const handleSaveModule = async (moduleData: any) => {
    try {
      if (isAdding) {
        // Ajouter un nouveau module
        const { data, error } = await supabase
          .from('modules')
          .insert([moduleData])
          .select()
          .single();
        
        if (error) {
          console.error('Erreur lors de l\'ajout:', error);
          alert('Erreur lors de l\'ajout du module');
          } else {
          setModules([data, ...modules]);
          setShowModal(false);
          setEditingModule(null);
          setIsAdding(false);
          alert('Module ajouté avec succès');
        }
      } else {
        // Modifier un module existant
        const { error } = await supabase
          .from('modules')
          .update(moduleData)
          .eq('id', editingModule?.id);

        if (error) {
          console.error('Erreur lors de la modification:', error);
          alert('Erreur lors de la modification du module');
            } else {
          setModules(modules.map(m => 
            m.id === editingModule?.id ? { ...m, ...moduleData } : m
          ));
          setShowModal(false);
          setEditingModule(null);
          alert('Module modifié avec succès');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du module');
    }
  };

  // Obtenir les informations du token
  const getTokenInfo = (module: Module): TokenInfo => {
    const moduleName = module.title.toLowerCase().replace(/\s+/g, '');
    
    // Mapping des URLs des modules
    const moduleUrls: { [key: string]: string } = {
      'stablediffusion': 'https://stablediffusion.regispailler.fr',
      'iaphoto': 'https://iaphoto.regispailler.fr', 
      'iametube': 'https://metube.regispailler.fr',
      'chatgpt': 'https://chatgpt.regispailler.fr',
      'librespeed': 'https://librespeed.regispailler.fr',
      'psitransfer': 'https://psitransfer.regispailler.fr',
      'pdf+': 'https://pdfplus.regispailler.fr',
      'aiassistant': 'https://aiassistant.regispailler.fr',
      'cogstudio': 'https://cogstudio.regispailler.fr',
      'ruinedfooocus': 'https://ruinedfooocus.regispailler.fr',
      'invoke': 'https://invoke.regispailler.fr'
    };
                              
    const baseUrl = moduleUrls[moduleName] || 'https://stablediffusion.regispailler.fr';
    const accessUrl = `${baseUrl}?token={JWT_TOKEN}`;
    
    return {
      moduleName,
      baseUrl,
      accessUrl,
      permissions: ['read', 'access', 'write', 'advanced_features'],
      expiresIn: '72h',
      jwtSecret: process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production'
    };
  };

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Rendu principal du composant
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  } 

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des modules</h1>
          <p className="mt-2 text-gray-600">Gérez les modules disponibles sur la plateforme</p>
        </div>

        {/* Bouton d'ajout */}
        <div className="mb-6">
            <button
            onClick={handleAddModule}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            Ajouter un module
            </button>
          </div>

        {/* Tableau des modules */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modules.map((module) => {
                  const moduleTokensList = moduleTokens[module.id] || [];
                  const activeTokens = moduleTokensList.filter(token => token.is_active);
                  const expiredTokens = moduleTokensList.filter(token => new Date(token.expires_at) < new Date());
                  
                  return (
                    <tr key={module.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                                 <div>
                          <div className="text-sm font-medium text-gray-900">{module.title}</div>
                          {module.subtitle && (
                            <div className="text-sm text-gray-500">{module.subtitle}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {module.category}
                          </span>
                          {module.categories && module.categories.length > 0 && (
                            module.categories.map((cat, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {cat}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {module.price > 0 ? `${module.price}€` : 'Gratuit'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">
                              {moduleTokensList.length} total
                            </span>
                            {activeTokens.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {activeTokens.length} actifs
                              </span>
                            )}
                            {expiredTokens.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {expiredTokens.length} expirés
                              </span>
                            )}
                     </div>
                          {moduleTokensList.length > 0 && (
                            <button
                              onClick={() => handleManageModule(module)}
                              className="text-xs text-blue-600 hover:text-blue-900 underline"
                            >
                              Gérer les tokens
                            </button>
                   )}
                </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditModule(module)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleManageModule(module)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Gérer
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal pour ajouter/modifier un module */}
        {showModal && (
          <UnifiedModuleModal
            module={editingModule}
            isAdding={isAdding}
            onSave={handleSaveModule}
            onClose={() => {
              setShowModal(false);
              setEditingModule(null);
              setIsAdding(false);
            }}
          />
        )}

        {/* Modal pour gérer un module */}
        {showManageModal && selectedModule && (
          <UnifiedModuleModal
            module={selectedModule}
            isAdding={false}
            onSave={handleSaveModule}
            onClose={() => {
              setShowManageModal(false);
              setSelectedModule(null);
            }}
            onCheckStatus={checkServiceStatus}
            tokenInfo={getTokenInfo(selectedModule)}
            moduleTokens={moduleTokens[selectedModule.id] || []}
            onEditToken={handleEditToken}
            onDeleteToken={handleDeleteToken}
          />
                   )}
                </div>
               </div>
  );
} 