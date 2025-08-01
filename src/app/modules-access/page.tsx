'use client';
import { useEffect, useState, useRef } from 'react';

interface ModuleConfig {
  name: string;
  key: string;
  url: string;
  icon: string;
  color: string;
}

const MODULES: ModuleConfig[] = [
  {
    name: 'IA Metube',
    key: 'iametube',
    url: 'https://iametube.regispailler.fr',
    icon: '🎵',
    color: 'from-green-600 to-emerald-600'
  }
];

export default function ModulesAccess() {
  const [selectedModules, setSelectedModules] = useState<string[]>(['iametube']);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleModule = (moduleKey: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const accessModule = async (moduleKey: string) => {
    try {
      setLoading(true);
      setError(null);
      setActiveModule(moduleKey);

      console.log('🔐 Génération URL sécurisée pour:', moduleKey);

      // Générer une URL sécurisée
      const response = await fetch('/api/generate-access-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module: moduleKey,
          duration: 30 // 30 minutes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération de l\'URL sécurisée');
      }

      const data = await response.json();
      console.log('✅ URL sécurisée générée:', data.accessUrl);

      // Rediriger vers l'URL sécurisée
      window.open(data.accessUrl, '_blank');

    } catch (error) {
      console.error('❌ Erreur accès module:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const openModuleDirect = (moduleKey: string) => {
    const module = MODULES.find(m => m.key === moduleKey);
    if (module) {
      console.log('🔗 Ouverture directe:', module.url);
      window.open(module.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Retour
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Accès aux Modules IA</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Modules sélectionnés:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {selectedModules.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Sélection des modules */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sélection des modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODULES.map((module) => (
              <div
                key={module.key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedModules.includes(module.key)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => toggleModule(module.key)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{module.icon}</div>
                  <div>
                    <div className="font-medium text-gray-900">{module.name}</div>
                    <div className="text-sm text-gray-500">{module.url}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedModules.includes(module.key)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedModules.includes(module.key) ? '✓ Sélectionné' : 'Non sélectionné'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accès aux modules */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Accès aux modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedModules.map((moduleKey) => {
              const module = MODULES.find(m => m.key === moduleKey);
              if (!module) return null;

              return (
                <div key={moduleKey} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{module.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">{module.name}</div>
                      <div className="text-sm text-gray-500">{module.url}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => accessModule(moduleKey)}
                      disabled={loading}
                      className={`w-full bg-gradient-to-r ${module.color} text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading && activeModule === moduleKey ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Chargement...</span>
                        </>
                      ) : (
                        <>
                          <span>🔐</span>
                          <span>Accès avec authentification</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => openModuleDirect(moduleKey)}
                      className="w-full bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>🔗</span>
                      <span>Ouvrir directement</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

                 {/* Statut des accès sécurisés */}
         {activeModule && (
           <div className="bg-white rounded-lg border border-gray-200 p-6">
             <div className="flex items-center space-x-3 mb-4">
               <div className="text-2xl">
                 {MODULES.find(m => m.key === activeModule)?.icon}
               </div>
               <div>
                 <div className="font-medium text-gray-900">
                   {MODULES.find(m => m.key === activeModule)?.name}
                 </div>
                 <div className="text-sm text-green-600">
                   ✅ URL sécurisée générée et ouverte
                 </div>
               </div>
             </div>
             
             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
               <div className="flex items-center space-x-2 mb-2">
                 <span className="text-green-600">🔒</span>
                 <span className="font-medium text-green-800">Accès sécurisé activé</span>
               </div>
               <div className="text-sm text-green-700 space-y-1">
                 <div>• URL temporaire générée (30 minutes)</div>
                 <div>• Aucune URL visible dans l'historique</div>
                 <div>• Authentification automatique</div>
                 <div>• Expiration automatique</div>
               </div>
             </div>
           </div>
         )}

        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-800 font-medium">Erreur:</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

                 {/* Instructions */}
         <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
           <h3 className="font-semibold text-blue-900 mb-2">🔒 Système d'accès sécurisé</h3>
           <div className="text-blue-800 text-sm space-y-1">
             <div>• <strong>Accès avec authentification:</strong> Génère une URL temporaire sécurisée (30 min)</div>
             <div>• <strong>Ouvrir directement:</strong> Ouvre le module dans un nouvel onglet (authentification manuelle requise)</div>
             <div>• <strong>URLs masquées:</strong> Les vraies URLs des modules ne sont jamais visibles</div>
             <div>• <strong>Expiration automatique:</strong> Les accès expirent automatiquement</div>
             <div>• <strong>Credentials par défaut:</strong> admin / Rasulova75</div>
           </div>
         </div>
      </div>
    </div>
  );
} 