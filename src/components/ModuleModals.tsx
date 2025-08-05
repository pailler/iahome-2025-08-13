'use client';

import { useState, useEffect } from 'react';

interface Module {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  categories?: string[];
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

// Composant modal unifié pour l'édition/ajout de modules
export function UnifiedModuleModal({ 
  module, 
  isAdding, 
  onSave, 
  onClose, 
  onCheckStatus, 
  tokenInfo, 
  moduleTokens, 
  onEditToken, 
  onDeleteToken 
}: {
  module: Module | null;
  isAdding: boolean;
  onSave: (moduleData: any) => void;
  onClose: () => void;
  onCheckStatus?: (moduleTitle: string) => void;
  tokenInfo?: TokenInfo | null;
  moduleTokens?: AccessToken[];
  onEditToken?: (tokenId: string, updatedData: Partial<AccessToken>) => void;
  onDeleteToken?: (tokenId: string) => void;
}) {
  const [isManaging, setIsManaging] = useState(false);
  const [editingToken, setEditingToken] = useState<AccessToken | null>(null);
  const [showTokenEditModal, setShowTokenEditModal] = useState(false);
  
  // État pour les paramètres de token éditables
  const [tokenSettings, setTokenSettings] = useState<EditableTokenSettings>({
    baseUrl: '',
    customUrl: '',
    permissions: ['read', 'access', 'write', 'advanced_features'],
    expiresIn: '72h',
    useCustomUrl: false
  });

  // Permissions disponibles
  const availablePermissions = [
    'read', 'write', 'access', 'admin', 'upload', 'download', 
    'advanced_features', 'api_access', 'user_management', 'system_config'
  ];

  const [formData, setFormData] = useState(() => {
    if (module) {
      return {
        title: module.title || '',
        description: module.description || '',
        subtitle: module.subtitle || '',
        category: module.category || '',
        categories: module.categories || [],
        price: module.price || 0,
        youtube_url: module.youtube_url || ''
      };
    }
    
    return {
      title: '',
      description: '',
      subtitle: '',
      category: '',
      categories: [],
      price: 0,
      youtube_url: ''
    };
  });

  // Mettre à jour le formulaire quand le module change
  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title || '',
        description: module.description || '',
        subtitle: module.subtitle || '',
        category: module.category || '',
        categories: module.categories || [],
        price: module.price || 0,
        youtube_url: module.youtube_url || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        subtitle: '',
        category: '',
        categories: [],
        price: 0,
        youtube_url: ''
      });
    }
  }, [module]);

  // Gérer l'édition d'un token
  const handleEditTokenModal = (token: AccessToken) => {
    setEditingToken(token);
    setShowTokenEditModal(true);
  };

  // Sauvegarder les modifications d'un token
  const handleSaveTokenEdit = async (updatedData: Partial<AccessToken>) => {
    if (editingToken && onEditToken) {
      await onEditToken(editingToken.id, updatedData);
      setShowTokenEditModal(false);
      setEditingToken(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateAccessUrl = () => {
    const baseUrl = tokenSettings.useCustomUrl ? tokenSettings.customUrl : tokenSettings.baseUrl;
    return `${baseUrl}?token={JWT_TOKEN}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isAdding ? 'Ajouter un module' : isManaging ? `Gérer ${module?.title}` : 'Modifier le module'}
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
                    Titre du module
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre du module"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sous-titre du module (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sous-titre du module"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie principale
                  </label>
                  <select
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
                    <option value="Web Tools">Web Tools</option>
                    <option value="IA FORMATION">IA FORMATION</option>
                    <option value="IA DEVELOPPEMENT">IA DEVELOPPEMENT</option>
                    <option value="BUILDING BLOCKS">BUILDING BLOCKS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégories multiples
                  </label>
                  <div className="space-y-2">
                    {[
                      'IA ASSISTANT', 'IA BUREAUTIQUE', 'IA PHOTO', 'IA VIDEO', 
                      'IA MAO', 'IA PROMPTS', 'IA MARKETING', 'IA DESIGN', 
                      'Web Tools', 'IA FORMATION', 'IA DEVELOPPEMENT', 'BUILDING BLOCKS'
                    ].map((cat) => (
                      <label key={cat} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.categories?.includes(cat) || false}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...(formData.categories || []), cat]
                              : (formData.categories || []).filter(c => c !== cat);
                            setFormData({...formData, categories: newCategories});
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section Description et contenu */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-4">📝 Description et contenu</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description du module
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Description détaillée du module"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL YouTube (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_url || ''}
                    onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>

            {/* Section Prix et accès */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">💰 Prix et accès</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (en euros)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Section Gestion des tokens (seulement en mode gestion) */}
            {!isAdding && moduleTokens && moduleTokens.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">🔑 Tokens d'accès associés</h3>
                <div className="space-y-4">
                  <div className="text-sm text-purple-700 mb-4">
                    {moduleTokens.length} token(s) associé(s) à ce module
                  </div>
                  
                  <div className="space-y-3">
                    {moduleTokens.map((token) => {
                      const isExpired = new Date(token.expires_at) < new Date();
                      const usagePercentage = token.max_usage > 0 ? (token.current_usage / token.max_usage) * 100 : 0;
                      
                      return (
                        <div key={token.id} className="bg-white border border-purple-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">{token.name}</h4>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  token.is_active 
                                    ? isExpired 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {token.is_active ? (isExpired ? 'Expiré' : 'Actif') : 'Inactif'}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  token.access_level === 'admin' ? 'bg-red-100 text-red-800' :
                                  token.access_level === 'premium' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {token.access_level}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{token.description}</p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Créé le:</span>
                                  <div className="text-gray-600">
                                    {new Date(token.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Expire le:</span>
                                  <div className={`${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                                    {new Date(token.expires_at).toLocaleDateString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Utilisation:</span>
                                  <div className="text-gray-600">
                                    {token.current_usage} / {token.max_usage || '∞'}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Dernière utilisation:</span>
                                  <div className="text-gray-600">
                                    {token.last_used_at 
                                      ? new Date(token.last_used_at).toLocaleDateString()
                                      : 'Jamais'
                                    }
                                  </div>
                                </div>
                              </div>
                              
                              {token.max_usage > 0 && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progression d'utilisation</span>
                                    <span>{Math.round(usagePercentage)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        usagePercentage > 80 ? 'bg-red-500' :
                                        usagePercentage > 60 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-3">
                                <span className="font-medium text-gray-700 text-sm">Permissions:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {token.permissions.map((permission, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                      {permission}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              <button
                                onClick={() => handleEditTokenModal(token)}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => onDeleteToken && onDeleteToken(token.id)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Section Actions de service (seulement en mode gestion) */}
            {!isAdding && onCheckStatus && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-4">🔧 Actions de service</h3>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => onCheckStatus(module?.title || '')}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Vérifier le statut du service
                  </button>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isAdding ? 'Ajouter le module' : 'Sauvegarder les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal d'édition des tokens */}
      {showTokenEditModal && editingToken && (
        <TokenEditModal
          token={editingToken}
          onSave={handleSaveTokenEdit}
          onClose={() => {
            setShowTokenEditModal(false);
            setEditingToken(null);
          }}
          availablePermissions={availablePermissions}
        />
      )}
    </div>
  );
}

// Composant modal pour l'édition des tokens
function TokenEditModal({ 
  token, 
  onSave, 
  onClose, 
  availablePermissions 
}: {
  token: AccessToken;
  onSave: (updatedData: Partial<AccessToken>) => void;
  onClose: () => void;
  availablePermissions: string[];
}) {
  const [formData, setFormData] = useState({
    name: token.name,
    description: token.description,
    access_level: token.access_level,
    permissions: token.permissions,
    max_usage: token.max_usage,
    is_active: token.is_active,
    expires_at: new Date(token.expires_at).toISOString().slice(0, 16) // Format datetime-local
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const togglePermission = (permission: string) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    setFormData({ ...formData, permissions: newPermissions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Modifier le token</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du token
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau d'accès
                </label>
                <select
                  value={formData.access_level}
                  onChange={(e) => setFormData({...formData, access_level: e.target.value as 'basic' | 'premium' | 'admin'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilisation maximale
                </label>
                <input
                  type="number"
                  value={formData.max_usage}
                  onChange={(e) => setFormData({...formData, max_usage: parseInt(e.target.value) || 0})}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'expiration
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Token actif</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availablePermissions.map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 