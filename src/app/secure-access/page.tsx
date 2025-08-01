'use client';
import { useEffect, useRef, useState } from 'react';

interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const MODULES: ModuleConfig[] = [
  {
    id: '1',
    name: 'IA Tube',
    icon: '📹',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: '2',
    name: 'IA Metube',
    icon: '🎵',
    color: 'from-green-600 to-emerald-600'
  }
];

export default function SecureAccess() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const accessModule = (moduleId: string) => {
    try {
      setLoading(true);
      setActiveModule(moduleId);

      console.log('🔐 Accès module sécurisé:', moduleId);

      // Charger le module via le proxy sécurisé
      if (iframeRef.current) {
        iframeRef.current.src = `/api/secure-proxy?id=${moduleId}`;
      }

      // Simuler un délai pour l'affichage
      setTimeout(() => {
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur accès module:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-black bg-opacity-50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Retour
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <h1 className="text-xl font-semibold text-white">Accès Sécurisé aux Modules</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Modules disponibles:</span>
            <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs font-medium">
              {MODULES.length}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Sélection des modules */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Sélectionnez un module</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODULES.map((module) => (
              <div
                key={module.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeModule === module.id
                    ? 'border-blue-500 bg-blue-900 bg-opacity-50'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
                onClick={() => accessModule(module.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{module.icon}</div>
                  <div>
                    <div className="font-medium text-white">{module.name}</div>
                    <div className="text-sm text-gray-400">ID: {module.id}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activeModule === module.id
                      ? 'bg-blue-800 text-blue-200'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {activeModule === module.id ? '✓ Actif' : 'Cliquer pour accéder'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affichage du module */}
        {activeModule && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">
                    {MODULES.find(m => m.id === activeModule)?.icon}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {MODULES.find(m => m.id === activeModule)?.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {loading ? 'Chargement en cours...' : 'Module chargé'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  )}
                  <button
                    onClick={() => window.location.reload()}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Recharger"
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => setActiveModule(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Fermer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            
            <div className="h-[600px]">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title={`Module ${activeModule}`}
                allow="camera; microphone; geolocation; encrypted-media"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <h3 className="font-semibold text-white mb-2">🔒 Système d'accès sécurisé</h3>
          <div className="text-gray-300 text-sm space-y-1">
            <div>• <strong>URLs masquées:</strong> Les vraies URLs ne sont jamais visibles</div>
            <div>• <strong>IDs numériques:</strong> Utilisation d'identifiants simples (1, 2, 3)</div>
            <div>• <strong>Proxy sécurisé:</strong> Authentification automatique côté serveur</div>
            <div>• <strong>Aucune trace:</strong> Pas d'URLs dans l'historique du navigateur</div>
            <div>• <strong>Credentials cachés:</strong> Les mots de passe sont invisibles</div>
          </div>
        </div>
      </div>
    </div>
  );
} 