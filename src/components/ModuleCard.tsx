'use client';

import { useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    youtube_url?: string;
    url?: string;
    image_url?: string;
  };
  userEmail?: string;
}

export default function ModuleCard({ module, userEmail }: ModuleCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Fonction pour obtenir l'image par défaut basée sur le titre
  const getDefaultImage = (title: string) => {
    const titleLower = title.toLowerCase();
    
    // Images simples et fiables par catégorie
    const categoryImages = {
      'ia assistant': 'https://picsum.photos/400/225?random=1',
      'ia photo': 'https://picsum.photos/400/225?random=2',
      'ia video': 'https://picsum.photos/400/225?random=3',
      'ia audio': 'https://picsum.photos/400/225?random=4',
      'ia design': 'https://picsum.photos/400/225?random=5',
      'ia marketing': 'https://picsum.photos/400/225?random=6',
      'ia prompts': 'https://picsum.photos/400/225?random=7',
      'ia bureautique': 'https://picsum.photos/400/225?random=8',
      'ia formation': 'https://picsum.photos/400/225?random=9',
      'ia developpement': 'https://picsum.photos/400/225?random=10',
      'web tools': 'https://picsum.photos/400/225?random=11',
    };

    // Images spécifiques par module
    const moduleImages = {
      'metube': 'https://picsum.photos/400/225?random=12',
      'iatube': 'https://picsum.photos/400/225?random=13',
      'iaphoto': 'https://picsum.photos/400/225?random=14',
      'iavideo': 'https://picsum.photos/400/225?random=15',
      'chatgpt': 'https://picsum.photos/400/225?random=16',
      'gpt': 'https://picsum.photos/400/225?random=17',
      'stablediffusion': 'https://picsum.photos/400/225?random=18',
      'sdnext': 'https://picsum.photos/400/225?random=19',
      'ruinedfooocus': 'https://picsum.photos/400/225?random=20',
      'pdf': 'https://picsum.photos/400/225?random=21',
      'document': 'https://picsum.photos/400/225?random=22',
      'psitransfer': 'https://picsum.photos/400/225?random=23',
      'transfer': 'https://picsum.photos/400/225?random=24',
      'invoke': 'https://picsum.photos/400/225?random=25',
      'cogstudio': 'https://picsum.photos/400/225?random=26',
      'canva': 'https://picsum.photos/400/225?random=27',
      'figma': 'https://picsum.photos/400/225?random=28',
      'notion': 'https://picsum.photos/400/225?random=29',
      'slack': 'https://picsum.photos/400/225?random=30',
      'discord': 'https://picsum.photos/400/225?random=31',
      'zoom': 'https://picsum.photos/400/225?random=32',
      'teams': 'https://picsum.photos/400/225?random=33',
      'google': 'https://picsum.photos/400/225?random=34',
      'microsoft': 'https://picsum.photos/400/225?random=35',
      'adobe': 'https://picsum.photos/400/225?random=36',
      'autocad': 'https://picsum.photos/400/225?random=37',
      'blender': 'https://picsum.photos/400/225?random=38',
      'unity': 'https://picsum.photos/400/225?random=39',
      'unreal': 'https://picsum.photos/400/225?random=40',
      'photoshop': 'https://picsum.photos/400/225?random=41',
      'illustrator': 'https://picsum.photos/400/225?random=42',
      'premiere': 'https://picsum.photos/400/225?random=43',
      'after effects': 'https://picsum.photos/400/225?random=44',
      'audition': 'https://picsum.photos/400/225?random=45',
      'logic': 'https://picsum.photos/400/225?random=46',
      'ableton': 'https://picsum.photos/400/225?random=47',
      'fl studio': 'https://picsum.photos/400/225?random=48',
      'pro tools': 'https://picsum.photos/400/225?random=49',
      'cubase': 'https://picsum.photos/400/225?random=50',
    };

    // Chercher une correspondance dans les images de modules
    for (const [key, imageUrl] of Object.entries(moduleImages)) {
      if (titleLower.includes(key) || key.includes(titleLower)) {
        return imageUrl;
      }
    }

    // Chercher par catégorie
    for (const [category, imageUrl] of Object.entries(categoryImages)) {
      if (titleLower.includes(category) || category.includes(titleLower)) {
        return imageUrl;
      }
    }

    // Image par défaut générique
    return 'https://picsum.photos/400/225?random=100';
  };

  // Utiliser l'image du module si disponible, sinon l'image par défaut
  const imageUrl = module.image_url || getDefaultImage(module.title);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image du module */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
        {module.youtube_url && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}
        
        {!imageError ? (
          <img 
            src={imageUrl} 
            alt={module.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          // Fallback avec une image simple
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <img 
              src="https://picsum.photos/400/225?random=999"
              alt="Image par défaut"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {module.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            {formatPrice(module.price)}
          </span>
        </div>
      </div>

      {/* Contenu du module */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {module.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {module.description}
        </p>

        {/* Bouton d'action */}
        <Link
          href={`/card/${module.id}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>Voir les détails</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}


