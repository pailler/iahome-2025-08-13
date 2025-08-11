'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";
import Breadcrumb from "../../../components/Breadcrumb";
import Header from '../../../components/Header';

interface TokenConfig {
  id?: string;
  name: string;
  description: string;
  moduleId: string;
  moduleName: string;
  accessLevel: 'basic' | 'premium' | 'admin';
  expirationHours: number;
  permissions: string[];
  isActive: boolean;
  maxUsage?: number;
  currentUsage?: number;
  createdAt?: string;
  expiresAt?: string;
}

interface Module {
  id: number;
  title: string;
  description: string;
  category: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export default function TokenManagementPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour les données
  const [tokens, setTokens] = useState<TokenConfig[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingToken, setEditingToken] = useState<TokenConfig | null>(null);
  
  // État pour le formulaire de création/édition
  const [formData, setFormData] = useState<TokenConfig>({
    name: '',
    description: '',
    moduleId: '',
    moduleName: '',
    accessLevel: 'premium',
    expirationHours: 72,
    permissions: ['read', 'access'],
    isActive: true,
    maxUsage: 100
  });

  // Permissions disponibles
  const availablePermissions = [
    'read',
    'write', 
    'access',
    'admin',
    'advanced_features',
    'download',
    'upload',
    'delete',
    'share',
    'export'
  ];

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        setCurrentUser(currentSession.user);
        checkAdminStatus(currentSession.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
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
          setLoading(false);
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
        fetchAllData();
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la vérification admin:', err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Charger les modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('title', { ascending: true });

      if (modulesError) {
        console.error('Erreur chargement modules:', modulesError);
      } else {
        console.log('Modules chargés:', modulesData);
        setModules(modulesData || []);
      }

      // Charger les utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('email', { ascending: true });

      if (usersError) {
        console.error('Erreur chargement utilisateurs:', usersError);
      } else {
        setUsers(usersData || []);
      }

      // Charger les tokens depuis la table access_tokens
      const { data: tokensData, error: tokensError } = await supabase
        .from('access_tokens')
        .select(`
          *,
          modules:module_id (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (tokensError) {
        console.error('Erreur chargement tokens:', tokensError);
        // Fallback avec des tokens fictifs si la table n'existe pas encore
        const mockTokens: TokenConfig[] = [
          {
            id: '1',
            name: 'Token Stable Diffusion Premium',
            description: 'Accès complet à Stable Diffusion avec toutes les fonctionnalités',
            moduleId: 'sd-001',
            moduleName: 'stablediffusion',
            accessLevel: 'premium',
            expirationHours: 168,
            permissions: ['read', 'write', 'access', 'advanced_features'],
            isActive: true,
            maxUsage: 1000,
            currentUsage: 45,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 168 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2', 
            name: 'Token MeTube Basic',
            description: 'Accès de base à MeTube pour téléchargement',
            moduleId: 'mt-001',
            moduleName: 'metube',
            accessLevel: 'basic',
            expirationHours: 24,
            permissions: ['read', 'access'],
            isActive: true,
            maxUsage: 50,
            currentUsage: 12,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        setTokens(mockTokens);
      } else {
        console.log('Tokens récupérés depuis la base de données:', tokensData);
        const dbTokens = (tokensData || []).map((token: any) => ({
          id: token.id?.toString(),
          name: token.name || 'Token sans nom',
          description: token.description || '',
          moduleId: token.module_id?.toString() || '',
          moduleName: token.module_name || token.modules?.title || 'Module inconnu',
          accessLevel: token.access_level || 'premium',
          expirationHours: token.expiration_hours || 72,
          permissions: token.permissions || ['read', 'access'],
          isActive: token.is_active !== false,
          maxUsage: token.max_usage || 100,
          currentUsage: token.current_usage || 0,
          createdAt: token.created_at,
          expiresAt: token.expires_at
        }));
        setTokens(dbTokens);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    try {
      // Validation des champs requis
      if (!formData.name.trim()) {
        alert('Le nom du token est requis');
        return;
      }
      
      if (!formData.moduleId) {
        alert('Veuillez sélectionner un module');
        return;
      }
      
      if (formData.expirationHours <= 0) {
        alert('La durée d\'expiration doit être supérieure à 0');
        return;
      }
      
      if (formData.maxUsage && formData.maxUsage <= 0) {
        alert('Le nombre maximum d\'utilisations doit être supérieur à 0');
        return;
      }
      
      console.log('formData.moduleId:', formData.moduleId);
      console.log('modules disponibles:', modules);
      
      const selectedModule = modules.find(m => m.id === parseInt(formData.moduleId));
      
      if (!selectedModule) {
        console.log('Module non trouvé pour ID:', formData.moduleId);
        alert('Veuillez sélectionner un module valide');
        return;
      }
      
      console.log('Module sélectionné:', selectedModule);
      
      // Calculer la date d'expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + formData.expirationHours);
      
      // Vérifier que le module_id existe dans la table modules
      const { data: moduleCheck, error: moduleCheckError } = await supabase
        .from('modules')
        .select('id')
        .eq('id', parseInt(formData.moduleId))
        .single();

      if (moduleCheckError || !moduleCheck) {
        console.error('Module non trouvé dans la base de données:', moduleCheckError);
        alert('Le module sélectionné n\'existe pas dans la base de données');
        return;
      }

      const tokenData = {
        name: formData.name,
        description: formData.description,
        module_id: parseInt(formData.moduleId),
        module_name: selectedModule.title,
        access_level: formData.accessLevel,
        permissions: formData.permissions,
        is_active: formData.isActive,
        max_usage: formData.maxUsage || 100,
        current_usage: 0,
        expires_at: expiresAt.toISOString()
      };

      console.log('Données du token à insérer:', tokenData);

      console.log('Tentative d\'insertion avec tokenData:', tokenData);
      
      // Tentative d'insertion simplifiée
      const { data, error } = await supabase
        .from('access_tokens')
        .insert(tokenData)
        .select();

      console.log('Réponse Supabase - data:', data);
      console.log('Réponse Supabase - error:', error);

      if (error) {
        console.error('Erreur création token:', error);
        console.error('Détails de l\'erreur:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Erreur lors de la création du token: ${error.message || 'Erreur inconnue'}`);
        return;
      }

      if (data && data.length > 0) {
        const insertedToken = data[0];
        const newToken = {
          id: insertedToken.id,
          name: insertedToken.name,
          description: insertedToken.description,
          moduleId: insertedToken.module_id?.toString() || '',
          moduleName: insertedToken.module_name || selectedModule.title,
          accessLevel: insertedToken.access_level,
          expirationHours: formData.expirationHours,
          permissions: insertedToken.permissions || [],
          isActive: insertedToken.is_active,
          maxUsage: insertedToken.max_usage,
          currentUsage: insertedToken.current_usage || 0,
          createdAt: insertedToken.created_at,
          expiresAt: insertedToken.expires_at
        };
        
        setTokens([newToken, ...tokens]);
        setShowCreateForm(false);
        resetForm();
        alert('Token créé avec succès !');
      } else {
        console.error('Aucune donnée retournée après insertion');
        alert('Erreur: Aucune donnée retournée après insertion');
      }
    } catch (error) {
      console.error('Erreur création token:', error);
      alert('Erreur lors de la création du token');
    }
  };

  const handleUpdateToken = async () => {
    if (!editingToken?.id) return;
    
    try {
      // Validation des champs requis
      if (!formData.name.trim()) {
        alert('Le nom du token est requis');
        return;
      }
      
      if (!formData.moduleId) {
        alert('Veuillez sélectionner un module');
        return;
      }
      
      if (formData.expirationHours <= 0) {
        alert('La durée d\'expiration doit être supérieure à 0');
        return;
      }
      
      if (formData.maxUsage && formData.maxUsage <= 0) {
        alert('Le nombre maximum d\'utilisations doit être supérieur à 0');
        return;
      }
      
      const selectedModule = modules.find(m => m.id === formData.moduleId);
      
      if (!selectedModule) {
        alert('Veuillez sélectionner un module valide');
        return;
      }
      
      // Calculer la nouvelle date d'expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + formData.expirationHours);
      
      const updateData = {
        name: formData.name,
        description: formData.description,
        module_id: parseInt(formData.moduleId),
        module_name: selectedModule.title,
        access_level: formData.accessLevel,
        permissions: formData.permissions,
        is_active: formData.isActive,
        max_usage: formData.maxUsage || 100,
        expires_at: expiresAt.toISOString()
      };

      console.log('Données du token à mettre à jour:', updateData);

      const { data, error } = await supabase
        .from('access_tokens')
        .update(updateData)
        .eq('id', editingToken.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour token:', error);
        alert(`Erreur lors de la mise à jour du token: ${error.message}`);
        return;
      }

      if (data) {
        const updatedToken = {
          id: data.id,
          name: data.name,
          description: data.description,
          moduleId: data.module_id?.toString() || '',
          moduleName: data.module_name || selectedModule.title,
          accessLevel: data.access_level,
          expirationHours: formData.expirationHours,
          permissions: data.permissions || [],
          isActive: data.is_active,
          maxUsage: data.max_usage,
          currentUsage: data.current_usage,
          createdAt: data.created_at,
          expiresAt: data.expires_at
        };
        
        setTokens(tokens.map(t => t.id === editingToken.id ? updatedToken : t));
        setEditingToken(null);
        resetForm();
        alert('Token mis à jour avec succès !');
      }
    } catch (error) {
      console.error('Erreur mise à jour token:', error);
      alert('Erreur lors de la mise à jour du token');
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce token ?')) return;
    
    try {
      const { error } = await supabase
        .from('access_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) {
        console.error('Erreur suppression token:', error);
        alert(`Erreur lors de la suppression du token: ${error.message}`);
      } else {
        setTokens(tokens.filter(t => t.id !== tokenId));
        alert('Token supprimé avec succès !');
      }
    } catch (error) {
      console.error('Erreur suppression token:', error);
      alert('Erreur lors de la suppression du token');
    }
  };

  const handleEditToken = (token: TokenConfig) => {
    setEditingToken(token);
    setFormData({
      name: token.name,
      description: token.description,
      moduleId: token.moduleId,
      moduleName: token.moduleName,
      accessLevel: token.accessLevel,
      expirationHours: token.expirationHours,
      permissions: [...token.permissions],
      isActive: token.isActive,
      maxUsage: token.maxUsage || 100
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      moduleId: '',
      moduleName: '',
      accessLevel: 'premium',
      expirationHours: 72,
      permissions: ['read', 'access'],
      isActive: true,
      maxUsage: 100
    });
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const generateTokenPreview = () => {
    const selectedModule = modules.find(m => m.id === formData.moduleId);
    return {
      moduleName: selectedModule?.title || formData.moduleName,
      accessLevel: formData.accessLevel,
      permissions: formData.permissions,
      expirationHours: formData.expirationHours,
      maxUsage: formData.maxUsage
    };
  };

  // Contrôles d'accès
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez avoir les droits d'administrateur pour accéder à cette page.</p>
            <Link href="/admin" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Retour à l'administration</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <Breadcrumb items={[
          { label: 'Administration', href: '/admin' },
          { label: 'Gestion des Tokens', href: '/admin/tokens' }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Tokens d'Accès</h1>
          <p className="text-gray-600">Créez et gérez les tokens d'accès aux modules avec des paramètres personnalisables</p>
        </div>

        {/* Bouton de création */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Créer un nouveau token
          </button>
        </div>

        {/* Formulaire de création/édition */}
        {(showCreateForm || editingToken) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingToken ? 'Modifier le token' : 'Créer un nouveau token'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du token *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Token Stable Diffusion Premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Description détaillée du token..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module *
                  </label>
                  <select
                    value={formData.moduleId}
                    onChange={(e) => setFormData({...formData, moduleId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un module ({modules.length} modules disponibles)</option>
                    {modules.map(module => (
                      <option key={module.id} value={module.id.toString()}>
                        {module.title} (ID: {module.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d'accès
                  </label>
                  <select
                    value={formData.accessLevel}
                    onChange={(e) => setFormData({...formData, accessLevel: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Paramètres avancés */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée d'expiration (heures)
                  </label>
                  <input
                    type="number"
                    value={formData.expirationHours}
                    onChange={(e) => setFormData({...formData, expirationHours: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="8760" // 1 an
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisation maximale
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsage}
                    onChange={(e) => setFormData({...formData, maxUsage: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    placeholder="Illimité si vide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Token actif</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map(permission => (
                      <div key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700 capitalize">
                          {permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Aperçu du token */}
            {formData.moduleId && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Aperçu du token</h3>
                <div className="text-sm text-gray-600">
                  <p><strong>Module:</strong> {generateTokenPreview().moduleName}</p>
                  <p><strong>Niveau:</strong> {generateTokenPreview().accessLevel}</p>
                  <p><strong>Permissions:</strong> {generateTokenPreview().permissions.join(', ')}</p>
                  <p><strong>Expiration:</strong> {generateTokenPreview().expirationHours} heures</p>
                  <p><strong>Usage max:</strong> {generateTokenPreview().maxUsage || 'Illimité'}</p>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingToken(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={editingToken ? handleUpdateToken : handleCreateToken}
                disabled={!formData.name || !formData.moduleId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingToken ? 'Mettre à jour' : 'Créer le token'}
              </button>
            </div>
          </div>
        )}

        {/* Configuration des tokens par défaut */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Configuration des tokens par défaut</h2>
            <p className="text-sm text-gray-600 mt-1">Paramètres automatiques pour les tokens générés après paiement</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau d'accès par défaut
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="premium">Premium</option>
                  <option value="basic">Basic</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée d'expiration (heures)
                </label>
                <input
                  type="number"
                  defaultValue="72"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="8760"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilisation maximale
                </label>
                <input
                  type="number"
                  defaultValue="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Sauvegarder la configuration
              </button>
            </div>
          </div>
        </div>

        {/* Liste des tokens */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tokens existants</h2>
          </div>
          
          {tokens.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun token créé pour le moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tokens.map((token) => (
                    <tr key={token.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{token.name}</div>
                          <div className="text-sm text-gray-500">{token.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {token.moduleName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          token.accessLevel === 'admin' ? 'bg-red-100 text-red-800' :
                          token.accessLevel === 'premium' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {token.accessLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {token.currentUsage || 0} / {token.maxUsage || '∞'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          token.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {token.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditToken(token)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteToken(token.id!)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 