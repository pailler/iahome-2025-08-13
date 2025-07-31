'use client';

import { useState } from 'react';

export default function TestSimple() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testStableDiffusion = async () => {
    setLoading(true);
    setResult('Test en cours...');
    
    try {
      const response = await fetch('/api/module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module: 'stablediffusion',
          method: 'gradio-auth',
          action: 'bypass'
        }),
      });

      const data = await response.text();
      setResult(`Status: ${response.status}\nRéponse: ${data.substring(0, 500)}...`);
    } catch (error) {
      setResult(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAccess = async () => {
    setLoading(true);
    setResult('Test d\'accès direct en cours...');
    
    try {
      const response = await fetch('https://stablediffusion.regispailler.fr', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      setResult(`Accès direct - Status: ${response.status}\nHeaders: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    } catch (error) {
      setResult(`Erreur accès direct: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const testAutoMethod = async () => {
    setLoading(true);
    setResult('Test méthode automatique en cours...');
    
    try {
      const response = await fetch('/api/module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module: 'stablediffusion',
          method: 'auto',
          action: 'bypass'
        }),
      });

      const data = await response.text();
      setResult(`Status: ${response.status}\nRéponse: ${data.substring(0, 500)}...`);
    } catch (error) {
      setResult(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Simple - Authentification StableDiffusion</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests Disponibles</h2>
          
          <div className="space-y-4">
                         <button
               onClick={testStableDiffusion}
               disabled={loading}
               className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? 'Test en cours...' : '🔐 Test Authentification Gradio'}
             </button>

                         <button
               onClick={testDirectAccess}
               disabled={loading}
               className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? 'Test en cours...' : '🌐 Test Accès Direct'}
             </button>

             <button
               onClick={testAutoMethod}
               disabled={loading}
               className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {loading ? 'Test en cours...' : '🤖 Test Méthode Automatique'}
             </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Résultat du Test</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Cliquez sur "Test Authentification Launch Args" pour tester la méthode d'authentification automatique</li>
            <li>• Cliquez sur "Test Accès Direct" pour vérifier l'accessibilité du serveur StableDiffusion</li>
            <li>• Les résultats s'afficheront dans la section "Résultat du Test"</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 