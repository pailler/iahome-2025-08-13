'use client';
import { useEffect } from 'react';

export default function StableDiffusionSimple() {
  useEffect(() => {
    // Redirection directe vers Stable Diffusion avec credentials
    const redirectToStableDiffusion = () => {
      try {
        console.log('🔗 Redirection directe vers Stable Diffusion');
        
        // Construire l'URL avec les credentials
        const username = 'admin';
        const password = 'Rasulova75';
        const credentials = `${username}:${password}`;
        const encodedCredentials = btoa(credentials);
        
        // URL de Stable Diffusion avec authentification
        const stableDiffusionUrl = `https://${encodedCredentials}@stablediffusion.regispailler.fr`;
        
        console.log('🔗 URL avec credentials:', stableDiffusionUrl);
        
        // Redirection
        window.location.href = stableDiffusionUrl;
      } catch (error) {
        console.error('❌ Erreur redirection:', error);
        alert('Erreur lors de la redirection vers Stable Diffusion');
      }
    };

    // Redirection immédiate
    redirectToStableDiffusion();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers Stable Diffusion...</p>
        <p className="text-sm text-gray-500 mt-2">Authentification automatique en cours...</p>
        
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Si la redirection ne fonctionne pas automatiquement,<br />
            utilisez cette URL dans votre navigateur :
          </p>
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
            https://admin:Rasulova75@stablediffusion.regispailler.fr
          </div>
        </div>
      </div>
    </div>
  );
} 