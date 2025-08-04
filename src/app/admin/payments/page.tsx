'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import Breadcrumb from '../../../components/Breadcrumb';
import Header from '../../../components/Header';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payment_method: string;
  created_at: string;
  admin_notes?: string;
  profiles?: {
    email: string;
    full_name: string;
    role: string;
  };
}

interface PaymentStats {
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalPayments: number;
}

export default function AdminPaymentsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  
  // États pour les données
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    totalPayments: 0
  });
  
  // États pour les filtres
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  
  // États pour les modales
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('');

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

  // Refetch payments when session becomes available
  useEffect(() => {
    if (isAdmin && session?.access_token) {
      fetchPayments();
    }
  }, [isAdmin, session?.access_token]);

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
      if (userIsAdmin && session?.access_token) {
        fetchPayments();
      }
    } catch (error) {
      console.error('Erreur vérification admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      if (!session?.access_token) {
        console.error('Session non disponible');
        return;
      }

      const response = await fetch('/api/admin/payments', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la récupération des paiements');
      }

      const data = await response.json();
      setPayments(data.payments || []);
      setStats(data.stats || {
        totalRevenue: 0,
        successfulPayments: 0,
        failedPayments: 0,
        pendingPayments: 0,
        totalPayments: 0
      });
    } catch (error) {
      console.error('Erreur récupération paiements:', error);
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount) return;

    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'process_refund',
          paymentId: selectedPayment.id,
          refundAmount,
          adminNotes: refundReason
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du remboursement');
      }

      fetchPayments();
      setShowRefundModal(false);
      setSelectedPayment(null);
      setRefundAmount(0);
      setRefundReason('');
      alert('Remboursement traité avec succès');
    } catch (error) {
      console.error('Erreur remboursement:', error);
      alert('Erreur lors du remboursement');
    }
  };

  const handleExportPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'export_payments'
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const data = await response.json();
      
      // Créer un fichier CSV
      const csvContent = [
        ['ID', 'Email', 'Nom', 'Montant', 'Devise', 'Statut', 'Méthode', 'Module', 'Date'],
        ...data.payments.map((payment: Payment) => [
          payment.id,
          payment.profiles?.email || '',
          payment.profiles?.full_name || '',
          payment.amount,
          payment.currency,
          payment.status,
          payment.payment_method,
          payment.user_subscriptions?.[0]?.module_name || '',
          new Date(payment.created_at).toLocaleDateString('fr-FR')
        ])
      ].map(row => row.join(',')).join('\n');

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  // Filtrer les paiements
  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      payment.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const paymentDate = new Date(payment.created_at);
    const matchesDateRange = (!dateRange.start || paymentDate >= new Date(dateRange.start)) &&
                           (!dateRange.end || paymentDate <= new Date(dateRange.end));
    
    return matchesStatus && matchesSearch && matchesDateRange;
  });



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
          { label: 'Paiements', href: '/admin/payments' }
        ]} />

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Paiements</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleExportPayments}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📊 Exporter CSV
              </button>
              <button
                onClick={fetchPayments}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">€{stats.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-green-700">Revenus totaux</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.successfulPayments}</div>
              <div className="text-sm text-blue-700">Paiements réussis</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
              <div className="text-sm text-yellow-700">En attente</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{stats.failedPayments}</div>
              <div className="text-sm text-red-700">Échoués</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.totalPayments}</div>
              <div className="text-sm text-gray-700">Total</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Rechercher par email ou nom..."
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
              <option value="succeeded">Réussi</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Date début"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Date fin"
            />
          </div>

          {/* Tableau des paiements */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.profiles?.email || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.profiles?.full_name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payment.amount} {payment.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        N/A
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status === 'succeeded' ? 'Réussi' :
                         payment.status === 'pending' ? 'En attente' :
                         payment.status === 'failed' ? 'Échoué' : 'Remboursé'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payment.payment_method}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {payment.status === 'succeeded' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setRefundAmount(payment.amount);
                              setShowRefundModal(true);
                            }}
                            className="text-sm text-orange-600 hover:text-orange-900"
                          >
                            Rembourser
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // Afficher les détails du paiement
                            alert(`Détails du paiement:\nID: ${payment.id}\nNotes: ${payment.admin_notes || 'Aucune'}`);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-900"
                        >
                          Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun paiement trouvé
            </div>
          )}
        </div>

        {/* Modal de remboursement */}
        {showRefundModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Traiter un remboursement
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant du remboursement
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                    max={selectedPayment.amount}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du remboursement
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Raison du remboursement..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRefund}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Confirmer le remboursement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 