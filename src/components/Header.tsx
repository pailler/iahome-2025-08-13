'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../utils/supabaseClient';
import DynamicNavigation from './DynamicNavigation';

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Vérification de la configuration Supabase
  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Vérifier le rôle de l'utilisateur
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setRole(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setRole(data.role);
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle:', error);
        setRole('user');
      }
    };

    fetchUserRole();
  }, [session, user]);

  // Fonction pour obtenir l'URL d'accès d'un module
  const getModuleAccessUrl = async (moduleName: string) => {
    console.log('🔐 getModuleAccessUrl appelée pour:', moduleName);
    
    // Mapping des modules vers leurs pages d'accès sécurisées
    const secureModuleUrls: { [key: string]: string } = {

    };
    
    // Vérifier si l'utilisateur est connecté
    if (!user?.id) {
      console.log('❌ Utilisateur non connecté, redirection vers login');
      router.push('/login');
      return null;
    }
    
    console.log(`✅ Accès autorisé pour ${moduleName}, redirection vers la page sécurisée`);
    
    // Rediriger vers la page d'accès sécurisé appropriée
    const secureUrl = secureModuleUrls[moduleName];
    console.log('🎯 URL de redirection:', secureUrl);
    if (secureUrl) {
      console.log('🚀 Redirection vers:', secureUrl);
      router.push(secureUrl);
      return null;
    }
    
    // Fallback pour les modules non configurés
    return `/secure-module-access?module=${moduleName.toLowerCase()}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50">
      {/* Bannière bleue - Fonctions de connexion */}
      <div className="bg-blue-600 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            {/* Mode non connecté */}
            {!session ? (
              <div className="flex items-center space-x-4 text-sm">
                <span className="hidden sm:inline">Bienvenue sur IAhome</span>
                <div className="flex items-center space-x-3">
                  <button 
                    className="text-blue-100 hover:text-white transition-colors text-sm"
                    onClick={() => router.push('/login')}
                  >
                    Se connecter
                  </button>
                  <button 
                    className="bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors"
                    onClick={() => router.push('/register')}
                  >
                    Commencer
                  </button>
                </div>
              </div>
            ) : (
              /* Mode connecté */
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3 text-sm">
                  <span className="hidden sm:inline">Connecté en tant que</span>
                  <span className="font-medium">{user?.email}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      role === 'admin' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {role === 'admin' ? 'ADMIN' : 'CONNECTÉ'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/encours" 
                    className="bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors flex items-center space-x-1"
                  >
                    <span>📱</span>
                    <span className="hidden sm:inline">Mes applis</span>
                  </Link>
                  
                  <button 
                    className="text-blue-100 hover:text-white transition-colors text-sm" 
                    onClick={async () => { 
                      await supabase.auth.signOut(); 
                      router.push('/login'); 
                    }}
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bannière blanche - Navigation du site */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo et navigation */}
            <div className="flex items-center space-x-6">
              {/* Logo "IAhome" */}
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
                <span className="text-xl font-bold text-blue-900">IAhome</span>
              </Link>
              
              {/* Menu de navigation dynamique - Desktop */}
              <DynamicNavigation 
                menuName="main" 
                userRole={role || undefined}
                className="hidden md:flex items-center space-x-6"
              />
            </div>
            
            {/* Boutons à droite - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Contact commercial
              </button>
            </div>

            {/* Menu mobile */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Menu mobile déroulant */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                {/* Navigation mobile */}
                <DynamicNavigation 
                  menuName="main" 
                  userRole={role || undefined}
                  className="flex flex-col space-y-3"
                />
                
                {/* Boutons mobile */}
                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                  <button className="text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                    Contact commercial
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 