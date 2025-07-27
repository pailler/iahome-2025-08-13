'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function TestSubscriptionPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Vérifier la session
      addResult('🔍 Test 1: Vérification de la session utilisateur...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        addResult(`✅ Session trouvée pour: ${session.user.email}`);
      } else {
        addResult('❌ Aucune session trouvée - Veuillez vous connecter');
        return;
      }

      // Test 2: Vérifier l'accès à la table
      addResult('🔍 Test 2: Vérification de l\'accès à la table user_subscriptions...');
      const { data: tableTest, error: tableError } = await supabase
        .from('user_subscriptions')
        .select('count')
        .limit(1);

      if (tableError) {
        addResult(`❌ Erreur accès table: ${tableError.message}`);
        addResult(`Code d'erreur: ${tableError.code}`);
        addResult(`Détails: ${tableError.details}`);
      } else {
        addResult('✅ Accès à la table user_subscriptions OK');
      }

      // Test 3: Vérifier les abonnements de l'utilisateur
      addResult('🔍 Test 3: Vérification des abonnements de l\'utilisateur...');
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id);

      if (subError) {
        addResult(`❌ Erreur requête abonnements: ${subError.message}`);
        addResult(`Code d'erreur: ${subError.code}`);
        addResult(`Détails: ${subError.details}`);
      } else {
        addResult(`✅ Abonnements trouvés: ${subscriptions?.length || 0}`);
        if (subscriptions && subscriptions.length > 0) {
          addResult(`📋 Détails des abonnements: ${JSON.stringify(subscriptions, null, 2)}`);
        }
      }

      // Test 4: Vérifier les abonnements actifs
      addResult('🔍 Test 4: Vérification des abonnements actifs...');
      const { data: activeSubs, error: activeError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString());

      if (activeError) {
        addResult(`❌ Erreur requête abonnements actifs: ${activeError.message}`);
        addResult(`Code d'erreur: ${activeError.code}`);
        addResult(`Détails: ${activeError.details}`);
      } else {
        addResult(`✅ Abonnements actifs trouvés: ${activeSubs?.length || 0}`);
        if (activeSubs && activeSubs.length > 0) {
          addResult(`📋 Détails des abonnements actifs: ${JSON.stringify(activeSubs, null, 2)}`);
        }
      }

    } catch (error) {
      addResult(`❌ Erreur générale: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const runApiTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Test API: Vérification de l\'accès à la base de données...');
      
      const response = await fetch('/api/test-subscription-access');
      const data = await response.json();
      
      if (data.success) {
        addResult('✅ API accessible');
        data.results.forEach((result: any) => {
          if (result.status === 'success') {
            addResult(`✅ ${result.test}: OK`);
          } else if (result.status === 'error') {
            addResult(`❌ ${result.test}: ${result.error}`);
            addResult(`   Code: ${result.code}, Détails: ${result.details}`);
          }
        });
      } else {
        addResult(`❌ Erreur API: ${data.error}`);
      }
      
    } catch (error) {
      addResult(`❌ Erreur appel API: ${error}`);
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
            onClick={runTests}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Tests en cours...' : 'Tests côté client'}
          </button>
          
          <button
            onClick={runApiTests}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Tests en cours...' : 'Tests côté serveur'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Résultats des tests:</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Cliquez sur "Tests côté client" ou "Tests côté serveur" pour commencer...</p>
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