'use client';

import { useState } from 'react';

export default function TestIframePage() {
  const [iframeUrl, setIframeUrl] = useState('https://httpbin.org/html');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test iframe - Stable Diffusion</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration de test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de test :
              </label>
              <input
                type="text"
                value={iframeUrl}
                onChange={(e) => setIframeUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://httpbin.org/html"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                🖼️ Ouvrir iframe
              </button>
              
              <button
                onClick={() => setIframeUrl('https://httpbin.org/html')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Test HTTPBin
              </button>
              
              <button
                onClick={() => setIframeUrl('https://stablediffusion.regispailler.fr')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Test Stable Diffusion
              </button>
            </div>
          </div>
        </div>

        {/* Modal iframe */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">
                  Test iframe - {iframeUrl}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* iframe */}
              <div className="flex-1 p-4">
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-0 rounded-lg"
                  title="Test iframe"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-2 text-gray-700">
            <p>1. <strong>Test HTTPBin</strong> : Teste si l'iframe fonctionne avec une URL simple</p>
            <p>2. <strong>Test Stable Diffusion</strong> : Teste l'accès à votre domaine Stable Diffusion</p>
            <p>3. <strong>URL personnalisée</strong> : Entrez une URL de votre choix pour tester</p>
            <p>4. <strong>Cliquez "Ouvrir iframe"</strong> pour voir le résultat</p>
          </div>
        </div>
      </div>
    </div>
  );
} 