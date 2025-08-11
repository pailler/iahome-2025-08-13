'use client';

export default function TestImagesPage() {
  const testImages = [
    '/images/iatube.jpg',
    '/images/iaphoto.jpg',
    '/images/chatgpt.jpg',
    '/images/stablediffusion.jpg',
    '/images/pdf-plus.jpg',
    '/images/psitransfer.jpg',
    '/images/iametube-interface.svg',
    '/images/communaute-ia-interface.svg',
    '/images/canvas-framework.svg',
    '/images/iavideo-interface.svg',
    '/images/iaphoto-interface.svg',
    '/images/sdnext-interface.svg'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test des Images Locales
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testImages.map((imagePath, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-2">{imagePath}</h3>
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imagePath}
                  alt={`Test ${imagePath}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-red-500">
                        ❌ Erreur de chargement
                      </div>
                    `;
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-green-500">
                        ✅ Image chargée avec succès
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Instructions de test
          </h2>
          <ul className="text-blue-800 space-y-2">
            <li>• Vérifiez que toutes les images se chargent correctement</li>
            <li>• Si une image ne se charge pas, vérifiez le chemin dans le dossier public/images</li>
            <li>• Les images doivent être au format JPG, PNG ou SVG</li>
            <li>• Assurez-vous que les permissions de fichiers sont correctes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
