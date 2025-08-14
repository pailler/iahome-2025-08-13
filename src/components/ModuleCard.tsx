'use client';

import { useState } from 'react';
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
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Fonction pour obtenir l'image appropriée selon le module
  const getModuleImage = (title: string, imageUrl?: string) => {
    if (imageUrl) return imageUrl;
    
    const titleLower = title.toLowerCase();
    
    // Utiliser l'icône PDF SVG pour les modules PDF
    if (titleLower.includes('pdf') || titleLower.includes('pdf+')) {
      return '/images/pdf-icon.svg';
    }
    
    // Image par défaut pour les autres modules
    return 'https://picsum.photos/400/225?random=1';
  };

  // Utiliser l'image appropriée pour le module
  const imageUrl = getModuleImage(module.title, module.image_url);

  const handleImageError = () => {
    setImageError(true);
  };

  // Déterminer le style du prix
  const isFree = module.price === 0;
  const priceStyle = isFree 
    ? "bg-green-100 text-green-800 border-green-200" 
    : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image du module */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
        {module.youtube_url && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              {/* Icône Play en CSS */}
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
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
          // Fallback avec l'image par défaut
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
            <img 
              src="https://picsum.photos/400/225?random=1"
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
          <span className={`${priceStyle} text-sm font-bold px-3 py-1 rounded-full border`}>
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
          {/* Icône Arrow Right en CSS */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}


