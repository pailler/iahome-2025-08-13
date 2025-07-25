'use client';

import { useState } from 'react';

export default function TestStripePage() {
  const [testResult, setTestResult] = useState<string>('');

  const testStripeConfig = async () => {
    try {
      // Test côté client
      const clientKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      console.log('Clé publique Stripe côté client:', clientKey ? 'Présente' : 'Manquante');
      
      // Test côté serveur
      const response = await fetch('/api/test-stripe-config');
      const result = await response.json();
      
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Erreur: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 pt-16">
      <div className="max-w-4xl mx-auto px-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Test Configuration Stripe</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Vérification des clés</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <strong>Clé publique côté client:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Configurée' : '❌ Manquante'}
              </span>
            </div>
            
            <div>
              <strong>Clé secrète côté serveur:</strong> 
              <span className="ml-2 px-2 py-1 rounded text-sm bg-gray-100 text-gray-700">
                {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Vérifier côté serveur' : '❌ Non testable'}
              </span>
            </div>
          </div>
          
          <button
            onClick={testStripeConfig}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Tester la configuration complète
          </button>
        </div>
        
        {testResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Résultat du test</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 