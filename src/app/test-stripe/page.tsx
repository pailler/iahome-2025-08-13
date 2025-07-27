'use client';

import { useState } from 'react';

export default function TestStripePage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testStripeConfig = async () => {
    setLoading(true);
    setResult('Test en cours...');
    
    try {
      const response = await fetch('/api/test-stripe-config', {
        method: 'GET',
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testPaymentIntent = async () => {
    setLoading(true);
    setResult('Test paiement en cours...');
    
    try {
      const testItems = [
        { id: '1', title: 'Test Item', price: 10 }
      ];
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: testItems,
          customerEmail: 'test@example.com',
          type: 'payment',
        }),
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Test Configuration Stripe</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testStripeConfig}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Test en cours...' : 'Test Configuration Stripe'}
          </button>
          
          <button
            onClick={testPaymentIntent}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            {loading ? 'Test en cours...' : 'Test Création Session'}
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Résultat :</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {result || 'Cliquez sur un bouton pour tester...'}
          </pre>
        </div>
      </div>
    </div>
  );
} 