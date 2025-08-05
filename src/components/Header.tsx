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
    <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Logo et navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo "IAhome" */}
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-bold text-blue-900">IAhome</span>
            </Link>
            
            {/* Menu de navigation dynamique */}
            <DynamicNavigation 
              menuName="main" 
              userRole={role}
              className="hidden md:flex items-center space-x-6"
            />
          </div>
          
          {/* Boutons à droite */}
          <div className="flex items-center space-x-4">
            
            {!session ? (
              <>
                <button className="text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  Contact commercial
                </button>
                <button className="text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => router.push('/login')}>
                  Se connecter
                </button>
                <button className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => router.push('/register')}>
                  Commencer
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">

                
                <span className="text-sm text-gray-600">{user?.email}</span>
                
                {/* Indicateur en ligne */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    role === 'admin' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {role === 'admin' ? 'ADMIN' : 'CONNECTÉ'}
                  </div>
                </div>
                
                <Link 
                  href="/encours" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2 text-sm"
                >
                  <span>📱</span>
                  <span>Mes applis</span>
                </Link>
                
                <button 
                  className="text-gray-700 font-medium px-3 py-1 rounded hover:bg-gray-100 text-sm" 
                  onClick={async () => { 
                    await supabase.auth.signOut(); 
                    router.push('/login'); 
                  }}
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 