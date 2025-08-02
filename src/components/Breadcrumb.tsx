'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumb({ items = [], showHome = true }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Générer automatiquement les items si aucun n'est fourni
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];
    
    if (showHome) {
      breadcrumbItems.push({ label: 'Accueil', href: '/' });
    }
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Mapper les segments aux labels plus lisibles
      let label = segment;
      switch (segment) {
        case 'admin':
          label = 'Administration';
          break;
        case 'cartes':
          label = 'Modules';
          break;
        case 'blog':
          label = 'Blog';
          break;
        case 'users':
          label = 'Utilisateurs';
          break;
        case 'card':
          label = 'Module';
          break;
        case 'access':
          label = 'Accès';
          break;
        case 'proxy':
          label = 'Proxy';
          break;
        case 'modules':
          label = 'Modules';
          break;
        case 'modules-access':
          label = 'Accès aux modules';
          break;
        case 'secure-access':
          label = 'Accès sécurisé';
          break;
        case 'login':
          label = 'Connexion';
          break;
        case 'register':
          label = 'Inscription';
          break;
        case 'success':
          label = 'Succès';
          break;
        case 'cancel':
          label = 'Annulation';
          break;
        case 'encours':
          label = 'En cours';
          break;
        case 'selections':
          label = 'Sélections';
          break;
        case 'test':
          label = 'Test';
          break;
        case 'debug':
          label = 'Debug';
          break;
        default:
          // Capitaliser la première lettre et remplacer les tirets par des espaces
          label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }
      
      // Ne pas ajouter de lien pour le dernier segment (page courante)
      const isLast = index === segments.length - 1;
      breadcrumbItems.push({
        label,
        href: isLast ? undefined : currentPath
      });
    });
    
    return breadcrumbItems;
  };
  
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbItems();
  
  if (breadcrumbItems.length <= 1) {
    return null; // Ne pas afficher le breadcrumb s'il n'y a qu'un seul élément
  }
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3" aria-label="Fil d'Ariane">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg 
                  className="w-4 h-4 text-gray-400 mx-2" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
              
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-semibold">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
} 