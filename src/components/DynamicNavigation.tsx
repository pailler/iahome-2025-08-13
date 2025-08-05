'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MenuService, MenuItem } from '../utils/menuService';

interface DynamicNavigationProps {
  menuName: string;
  className?: string;
  userRole?: string;
  isMobile?: boolean;
}

export default function DynamicNavigation({ 
  menuName, 
  className = '', 
  userRole,
  isMobile = false 
}: DynamicNavigationProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await MenuService.getMenuItems(menuName, userRole);
        setMenuItems(items);
      } catch (err) {
        console.error(`Erreur lors du chargement du menu ${menuName}:`, err);
        setError('Erreur lors du chargement du menu');
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, [menuName, userRole]);

  if (loading) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-14 rounded"></div>
      </div>
    );
  }

  if (error) {
    console.warn(`Erreur de menu ${menuName}:`, error);
    return null;
  }

  if (menuItems.length === 0) {
    return null;
  }

  const renderMenuItem = (item: MenuItem) => {
    const linkProps = {
      href: item.url || '#',
      target: item.is_external ? '_blank' : item.target,
      rel: item.is_external ? 'noopener noreferrer' : undefined,
      className: `text-gray-700 hover:text-blue-600 font-medium transition-colors ${
        isMobile ? 'block py-2 px-4 hover:bg-gray-50' : ''
      }`
    };

    const linkContent = (
      <>
        {item.icon && <span className="mr-2">{item.icon}</span>}
        {item.title}
      </>
    );

    return (
      <div key={item.id} className="relative group">
        <Link {...linkProps}>
          {linkContent}
        </Link>
        
        {/* Sous-menu pour les éléments avec enfants */}
        {item.children && item.children.length > 0 && (
          <div className={`
            ${isMobile 
              ? 'pl-4 mt-2 space-y-1' 
              : 'absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'
            }
          `}>
            {item.children.map(child => (
              <Link
                key={child.id}
                href={child.url || '#'}
                target={child.is_external ? '_blank' : child.target}
                rel={child.is_external ? 'noopener noreferrer' : undefined}
                className={`
                  block text-gray-700 hover:text-blue-600 transition-colors
                  ${isMobile ? 'py-1 px-2' : 'px-4 py-2 hover:bg-gray-50'}
                `}
              >
                {child.icon && <span className="mr-2">{child.icon}</span>}
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`flex items-center space-x-6 ${className}`}>
      {menuItems.map(renderMenuItem)}
    </nav>
  );
} 