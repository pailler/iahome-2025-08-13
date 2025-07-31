'use client';
import { useState } from 'react';

interface ModuleConfig {
  code: string;
  name: string;
  icon: string;
  color: string;
}

const MODULES: ModuleConfig[] = [
  {
    code: 'SD',
    name: 'Stable Diffusion',
    icon: '🎨',
    color: 'from-purple-600 to-pink-600'
  },
  {
    code: 'IT',
    name: 'IA Tube',
    icon: '📹',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    code: 'IM',
    name: 'IA Metube',
    icon: '🎵',
    color: 'from-green-600 to-emerald-600'
  }
];

export default function TestDirect() {
  const [loading, setLoading] = useState<string | null>(null);

  const accessModule = (code: string) => {
    try {
      setLoading(code);
      console.log('🔐 Accès direct avec code:', code);

      // Redirection directe via l'API
      window.open(`/api/direct-access?code=${code}`, '_blank');

      // Réinitialiser le loading après un délai
      setTimeout(() => {
        setLoading(null);
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur accès direct:', error);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test Accès Direct avec Codes Secrets</h1>

        {/* Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {MODULES.map((module) => (
            <div key={module.code} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">{module.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                  <p className="text-sm text-gray-500">Code: {module.code}</p>
                </div>
              </div>
              
              <button
                onClick={() => accessModule(module.code)}
                disabled={loading !== null}
                className={`w-full bg-gradient-to-r ${module.color} text-white font-semibold px-4 py-3 rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                {loading === module.code ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Redirection...</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>Accès Direct</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Informations */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🔐 Fonctionnement de l'Accès Direct</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">✅ Avantages</h4>
              <ul className="space-y-1">
                <li>• Redirection directe vers le module</li>
                <li>• Authentification automatique</li>
                <li>• Codes secrets courts (SD, IT, IM)</li>
                <li>• Pas d'iframe</li>
                <li>• Performance maximale</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔒 Sécurité</h4>
              <ul className="space-y-1">
                <li>• URLs masquées côté serveur</li>
                <li>• Credentials invisibles</li>
                <li>• Codes non-guessables</li>
                <li>• Pas de stockage client</li>
                <li>• Redirection sécurisée</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Retour */}
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
} 