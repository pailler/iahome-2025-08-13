'use client';

import { useState } from 'react';
import StripeCheckout from '../../components/StripeCheckout';

export default function TestPaymentPage() {
  const [result, setResult] = useState<string>('');

  const testItems = [
    {
      id: 'test-1',
      title: 'Test Article 1',
      description: 'Description de test',
      price: 10.00
    },
    {
      id: 'test-2', 
      title: 'Test Article 2',
      description: 'Description de test 2',
      price: 15.00
    }
  ];

  const handleSuccess = () => {
    setResult('✅ Paiement réussi !');
  };

  const handleError = (error: string) => {
    setResult(`❌ Erreur: ${error}`);
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 pt-16">
      <div className="max-w-4xl mx-auto px-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Test Paiement Stripe</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Articles de test</h2>
          
          <div className="space-y-4 mb-6">
            {testItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded p-4">
                <div className="font-semibold">{item.title}</div>
                <div className="text-gray-600">{item.description}</div>
                <div className="font-bold text-blue-600">{item.price} €</div>
              </div>
            ))}
          </div>
          
          <div className="text-lg font-semibold mb-4">
            Total: {testItems.reduce((sum, item) => sum + item.price, 0)} €
          </div>
          
          <StripeCheckout
            items={testItems}
            customerEmail="test@example.com"
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Résultat</h2>
            <div className={`p-4 rounded ${
              result.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 