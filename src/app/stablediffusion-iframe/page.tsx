'use client';
import { useEffect, useRef } from 'react';

export default function StableDiffusionIframe() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Fonction pour injecter l'authentification dans l'iframe
    const injectAuth = () => {
      if (iframeRef.current) {
        try {
          console.log('🔐 Injection authentification dans iframe');
          
          // Attendre que l'iframe soit chargé
          const iframe = iframeRef.current;
          
          iframe.onload = () => {
            try {
              // Injecter les credentials via JavaScript
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              
              if (iframeDoc) {
                // Créer un script pour injecter l'authentification
                const script = iframeDoc.createElement('script');
                script.textContent = `
                  // Injecter les credentials dans les formulaires
                  const forms = document.querySelectorAll('form');
                  forms.forEach(form => {
                    const usernameInput = form.querySelector('input[name="username"], input[name="user"], input[type="text"]');
                    const passwordInput = form.querySelector('input[name="password"], input[name="pass"], input[type="password"]');
                    
                    if (usernameInput && passwordInput) {
                      usernameInput.value = 'admin';
                      passwordInput.value = 'Rasulova75';
                      
                      // Soumettre automatiquement le formulaire
                      setTimeout(() => {
                        form.submit();
                      }, 1000);
                    }
                  });
                  
                  // Si pas de formulaire, essayer d'injecter directement
                  if (forms.length === 0) {
                    console.log('Aucun formulaire trouvé, injection directe...');
                  }
                `;
                
                iframeDoc.head.appendChild(script);
                console.log('✅ Script d\'authentification injecté');
              }
            } catch (error) {
              console.error('❌ Erreur injection dans iframe:', error);
            }
          };
          
        } catch (error) {
          console.error('❌ Erreur configuration iframe:', error);
        }
      }
    };

    // Injecter l'authentification après un délai
    setTimeout(injectAuth, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Stable Diffusion</span>
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Authentification automatique
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title="Recharger"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Iframe Stable Diffusion */}
      <div className="w-full h-[calc(100vh-80px)]">
        <iframe
          ref={iframeRef}
          src="https://stablediffusion.regispailler.fr"
          className="w-full h-full border-0"
          title="Stable Diffusion"
          allow="camera; microphone; geolocation; encrypted-media"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm max-w-xs">
        <div className="font-semibold mb-2">🔐 Authentification automatique</div>
        <div className="space-y-1 text-xs">
          <div>• Injection automatique des credentials</div>
          <div>• Soumission automatique du formulaire</div>
          <div>• Si cela ne fonctionne pas, utilisez :</div>
          <div className="bg-gray-800 p-1 rounded font-mono">
            admin / Rasulova75
          </div>
        </div>
      </div>
    </div>
  );
} 