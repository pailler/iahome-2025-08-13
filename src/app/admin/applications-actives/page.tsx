'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import Header from '../../../components/Header';

interface ActiveApplication {
  id: string;
  module_name: string;
  module_id: string;
  user_id: string;
  user_email: string;
  status: 'active' | 'inactive' | 'suspended';
  last_activity: string;
  created_at: string;
  expires_at: string;
  ip_address: string;
  user_agent: string;
  session_duration: number;
  access_count: number;
  admin_notes: string;
  is_manual_override: boolean;
  override_reason: string;
  profiles?: {
    email: string;
    full_name: string;
    role: string;
  };
}

interface AccessLog {
  id: string;
  application_id: string;
  module_name: string;
  user_id: string;
  user_email: string;
  action: 'login' | 'logout' | 'access' | 'blocked' | 'admin_override';
  ip_address: string;
  user_agent: string;
  timestamp: string;
  details: any;
  profiles?: {
    email: string;
    full_name: string;
    role: string;
  };
}

export default function ActiveApplicationsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour les données
  const [applications, setApplications] = useState<ActiveApplication[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [selectedTab, setSelectedTab] = useState<'applications' | 'logs'>('applications');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // États pour les modales
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ActiveApplication | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        setCurrentUser(currentSession.user);
        checkAdminStatus(currentSession.user.id, currentSession.access_token);
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
          checkAdminStatus(session.user.id, session.access_token);
        } else {
          setIsAdmin(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string, accessToken?: string) => {
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
      if (userIsAdmin && accessToken) {
        // Attendre un peu pour s'assurer que la session est bien chargée
        setTimeout(() => {
          fetchApplications(accessToken);
          fetchAccessLogs(accessToken);
        }, 500);
      }
    } catch (error) {
      console.error('Erreur vérification admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (accessToken?: string) => {
    try {
      const token = accessToken || session?.access_token;
      if (!token) {
        console.error('Aucun token d\'accès disponible');
        return;
      }

      const response = await fetch('/api/admin/active-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Erreur récupération applications:', error);
    }
  };

  const fetchAccessLogs = async (accessToken?: string) => {
    try {
      const token = accessToken || session?.access_token;
      if (!token) {
        console.error('Aucun token d\'accès disponible');
        return;
      }

      const response = await fetch('/api/admin/access-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des logs');
      }

      const data = await response.json();
      setAccessLogs(data.logs || []);
    } catch (error) {
      console.error('Erreur récupération logs:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !newStatus) return;

    try {
      const response = await fetch('/api/admin/active-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'update_status',
          applicationId: selectedApplication.id,
          status: newStatus,
          adminNotes,
          overrideReason
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Rafraîchir les données
      fetchApplications();
      setShowStatusModal(false);
      setSelectedApplication(null);
      setNewStatus('');
      setAdminNotes('');
      setOverrideReason('');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedApplications.length === 0) return;

    try {
      const response = await fetch('/api/admin/active-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'bulk_update',
          applicationIds: selectedApplications,
          status,
          adminNotes: `Mise à jour en lot vers ${status}`
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour en lot');
      }

      fetchApplications();
      setSelectedApplications([]);
    } catch (error) {
      console.error('Erreur mise à jour en lot:', error);
      alert('Erreur lors de la mise à jour en lot');
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) return;

    try {
      const response = await fetch('/api/admin/active-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'delete',
          applicationId
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      fetchApplications();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Filtrer les applications
  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesModule = filterModule === 'all' || app.module_name === filterModule;
    const matchesSearch = searchTerm === '' || 
      app.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.module_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesModule && matchesSearch;
  });

  // Obtenir les modules uniques
  const uniqueModules = [...new Set(applications.map(app => app.module_name))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Accès non autorisé. Vous devez être administrateur pour accéder à cette page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Applications Actives', href: '/admin/applications-actives' }
        ]} />

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Applications Actives</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedTab('applications')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === 'applications'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Applications ({applications.length})
              </button>
              <button
                onClick={() => setSelectedTab('logs')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === 'logs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Logs d'Accès ({accessLogs.length})
              </button>
            </div>
          </div>

          {selectedTab === 'applications' && (
            <div>
              {/* Filtres et recherche */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Rechercher par email ou module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les modules</option>
                  {uniqueModules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
                <button
                  onClick={fetchApplications}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Actualiser
                </button>
              </div>

              {/* Actions en lot */}
              {selectedApplications.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">
                      {selectedApplications.length} application(s) sélectionnée(s)
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkUpdate('active')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Activer
                      </button>
                      <button
                        onClick={() => handleBulkUpdate('inactive')}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Désactiver
                      </button>
                      <button
                        onClick={() => handleBulkUpdate('suspended')}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Suspendre
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tableau des applications */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApplications(filteredApplications.map(app => app.id));
                            } else {
                              setSelectedApplications([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière Activité
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accès
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(app.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedApplications([...selectedApplications, app.id]);
                              } else {
                                setSelectedApplications(selectedApplications.filter(id => id !== app.id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{app.user_email}</div>
                            <div className="text-sm text-gray-500">{app.profiles?.full_name || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {app.module_name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            app.status === 'active' ? 'bg-green-100 text-green-800' :
                            app.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status === 'active' ? 'Actif' :
                             app.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(app.last_activity).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {app.access_count}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setNewStatus(app.status === 'active' ? 'inactive' : 'active');
                                setShowStatusModal(true);
                              }}
                              className="text-sm text-blue-600 hover:text-blue-900"
                            >
                              {app.status === 'active' ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="text-sm text-red-600 hover:text-red-900"
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

              {filteredApplications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune application trouvée
                </div>
              )}
            </div>
          )}

          {selectedTab === 'logs' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={fetchAccessLogs}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Actualiser les logs
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accessLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{log.user_email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {log.module_name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.action === 'login' ? 'bg-green-100 text-green-800' :
                            log.action === 'logout' ? 'bg-gray-100 text-gray-800' :
                            log.action === 'access' ? 'bg-blue-100 text-blue-800' :
                            log.action === 'blocked' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {log.ip_address || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {accessLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun log d'accès trouvé
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de mise à jour de statut */}
        {showStatusModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Modifier le statut de l'application
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau statut
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes administrateur
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Notes optionnelles..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison de la modification
                  </label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Raison de la modification..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 