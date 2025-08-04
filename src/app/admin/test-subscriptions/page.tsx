'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';

interface TestSubscription {
  id: string;
  user_id: string;
  module_name: string;
  subscription_id: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
    role: string;
  };
}

interface TestSubscriptionStats {
  totalTestSubscriptions: number;
  activeTestSubscriptions: number;
  subscriptionsByUser: Record<string, TestSubscription[]>;
  subscriptionsByModule: Record<string, TestSubscription[]>;
}

export default function TestSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<TestSubscription[]>([]);
  const [stats, setStats] = useState<TestSubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    fetchTestSubscriptions();
  }, []);

  const fetchTestSubscriptions = async () => {
    try {
      setLoading(true);
      setMessage(''); // Clear previous messages
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setMessage('Session non trouvée');
        return;
      }

      const response = await fetch('/api/admin/clear-test-subscriptions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la récupération des abonnements test');
      }

      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.subscriptions || []);
        setStats({
          totalTestSubscriptions: data.totalTestSubscriptions || 0,
          activeTestSubscriptions: data.activeTestSubscriptions || 0,
          subscriptionsByUser: data.subscriptionsByUser || {},
          subscriptionsByModule: data.subscriptionsByModule || {}
        });
      } else {
        setMessage(`Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur récupération abonnements test:', error);
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUS les abonnements test ?')) {
      return;
    }

    await deleteSubscriptions();
  };

  const handleDeleteSelected = async () => {
    if (selectedSubscriptions.length === 0) {
      setMessage('Aucun abonnement sélectionné');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedSubscriptions.length} abonnement(s) test ?`)) {
      return;
    }

    await deleteSubscriptions(selectedSubscriptions);
  };

  const handleDeleteByUser = async () => {
    if (!selectedUser) {
      setMessage('Veuillez sélectionner un utilisateur');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer tous les abonnements test de ${selectedUser} ?`)) {
      return;
    }

    await deleteSubscriptions([], selectedUser);
  };

  const handleDeleteByModule = async () => {
    if (!selectedModule) {
      setMessage('Veuillez sélectionner un module');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer tous les abonnements test pour ${selectedModule} ?`)) {
      return;
    }

    await deleteSubscriptions([], '', selectedModule);
  };

  const deleteSubscriptions = async (subscriptionIds: string[] = [], userId: string = '', moduleName: string = '') => {
    try {
      setDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setMessage('Session non trouvée');
        return;
      }

      const response = await fetch('/api/admin/clear-test-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'delete',
          subscriptionIds,
          userId,
          moduleName
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.deletedCount} abonnement(s) test supprimé(s) avec succès`);
        setSelectedSubscriptions([]);
        fetchTestSubscriptions();
      } else {
        setMessage(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur suppression abonnements test:', error);
      setMessage('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    if (selectedUser && sub.profiles?.email !== selectedUser) return false;
    if (selectedModule && sub.module_name !== selectedModule) return false;
    return true;
  });

  const handleSelectSubscription = (subscriptionId: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(subscriptionId) 
        ? prev.filter(id => id !== subscriptionId)
        : [...prev, subscriptionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubscriptions.length === filteredSubscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(filteredSubscriptions.map(sub => sub.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des abonnements test...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Abonnements Test
          </h1>
          <p className="text-gray-600">
            Gérez et supprimez les abonnements de test créés pour les tests
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalTestSubscriptions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Actifs</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeTestSubscriptions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
              <p className="text-3xl font-bold text-purple-600">{Object.keys(stats.subscriptionsByUser).length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Modules</h3>
              <p className="text-3xl font-bold text-orange-600">{Object.keys(stats.subscriptionsByModule).length}</p>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleDeleteAll}
              disabled={deleting || subscriptions.length === 0}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Suppression...' : 'Supprimer Tout'}
            </button>
            
            <button
              onClick={handleDeleteSelected}
              disabled={deleting || selectedSubscriptions.length === 0}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {deleting ? 'Suppression...' : `Supprimer Sélectionnés (${selectedSubscriptions.length})`}
            </button>

            <button
              onClick={fetchTestSubscriptions}
              disabled={deleting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Actualiser
            </button>

            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">Tous</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="expired">Expirés</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Tous les utilisateurs</option>
                {stats && Object.keys(stats.subscriptionsByUser).map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">Tous les modules</option>
                {stats && Object.keys(stats.subscriptionsByModule).map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleDeleteByUser}
                disabled={deleting || !selectedUser}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 mr-2"
              >
                Supprimer par User
              </button>
              <button
                onClick={handleDeleteByModule}
                disabled={deleting || !selectedModule}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Supprimer par Module
              </button>
            </div>
          </div>
        </div>

        {/* Liste des abonnements */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Abonnements Test ({filteredSubscriptions.length})
              </h2>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSubscriptions.length === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tout sélectionner</span>
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sélection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSubscriptions.includes(subscription.id)}
                        onChange={() => handleSelectSubscription(subscription.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subscription.profiles?.email || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.profiles?.full_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subscription.module_name}</div>
                      <div className="text-sm text-gray-500">{subscription.subscription_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscription.status === 'active' && !isExpired(subscription.end_date)
                          ? 'bg-green-100 text-green-800'
                          : isExpired(subscription.end_date)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscription.status === 'active' && isExpired(subscription.end_date) 
                          ? 'Expiré' 
                          : subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(subscription.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(subscription.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun abonnement test trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 