'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function TestSubscriptionsPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        addResult(`✅ Session trouvée pour: ${session.user.email}`);
      } else {
        addResult('❌ Aucune session trouvée');
      }
    };
    getSession();
  }, []);

  const checkSubscriptions = async () => {
    if (!user?.id) {
      addResult('❌ Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Test 1: Vérification de la session...');
      addResult(`✅ Utilisateur: ${user.email} (ID: ${user.id})`);

      addResult('🔍 Test 2: Vérification des abonnements via API...');
      const response = await fetch(`/api/check-subscriptions?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        addResult(`✅ Total abonnements: ${data.totalSubscriptions}`);
        addResult(`✅ Abonnements actifs: ${data.activeSubscriptions}`);
        
        if (data.allSubscriptions.length > 0) {
          addResult('📋 Tous les abonnements:');
          data.allSubscriptions.forEach((sub: any) => {
            addResult(`   - ${sub.module_name} (${sub.status}) - Expire: ${new Date(sub.end_date).toLocaleDateString()}`);
          });
        }
        
        if (data.activeSubscriptions.length > 0) {
          addResult('📋 Abonnements actifs:');
          data.activeSubscriptions.forEach((sub: any) => {
            addResult(`   - ${sub.module_name} (${sub.status}) - Expire: ${new Date(sub.end_date).toLocaleDateString()}`);
          });
        }
      } else {
        addResult(`❌ Erreur API: ${data.error}`);
      }

      addResult('🔍 Test 3: Test de génération de lien...');
      const linkResponse = await fetch('/api/generate-access-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          moduleName: 'IAmetube',
          permissions: ['access']
        }),
      });

      const linkData = await linkResponse.json();
      if (linkData.success) {
        addResult(`✅ Lien généré: ${linkData.accessLink}`);
      } else {
        addResult(`❌ Erreur génération lien: ${linkData.error}`);
      }

    } catch (error) {
      addResult(`❌ Erreur générale: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestSubscription = async () => {
    if (!user?.id) {
      addResult('❌ Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Création d\'un abonnement de test...');
      
      const testSubscription = {
        user_id: user.id,
        module_name: 'IAmetube',
        subscription_id: 'test_sub_' + Date.now(),
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      };

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert(testSubscription)
        .select();

      if (error) {
        addResult(`❌ Erreur création abonnement: ${error.message}`);
      } else {
        addResult(`✅ Abonnement de test créé: ${data[0].id}`);
        addResult(`   Module: ${data[0].module_name}`);
        addResult(`   Statut: ${data[0].status}`);
        addResult(`   Expire: ${new Date(data[0].end_date).toLocaleDateString()}`);
      }

    } catch (error) {
      addResult(`❌ Erreur création: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 pt-12">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test des Abonnements</h1>
        
        <div className="mb-6 space-x-4">
          <button
            onClick={checkSubscriptions}
            disabled={loading || !user}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Test en cours...' : 'Vérifier les abonnements'}
          </button>
          
          <button
            onClick={createTestSubscription}
            disabled={loading || !user}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer un abonnement de test'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Résultats des tests:</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Cliquez sur "Vérifier les abonnements" pour commencer...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 