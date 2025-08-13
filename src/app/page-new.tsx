'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Breadcrumb from '../components/Breadcrumb';
import ModuleCard from '../components/ModuleCard';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [priceFilter, setPriceFilter] = useState('all');
  const [professionFilter, setProfessionFilter] = useState('all'); // CHANGÉ : experienceFilter -> professionFilter
  const [sortBy, setSortBy] = useState('most_used');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: boolean}>({});
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Vérification de la configuration Supabase
  useEffect(() => {
    console.log('Configuration Supabase:');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Présent' : 'Manquant');
    console.log('Client Supabase:', supabase);

    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log('Session actuelle:', currentSession);
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Changement d\'état d\'auth:', event, session);
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Effet pour surveiller les changements de session
  useEffect(() => {
    console.log('🔍 Session changée:', { 
      hasSession: !!session, 
      userEmail: user?.email,
      userId: user?.id 
    });
  }, [session, user]);

  // Vérifier les sélections actives de l'utilisateur
  useEffect(() => {
    const checkUserSubscriptions = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('module_access')
          .select(`
            module_id,
            expires_at,
            modules(title)
          `)
          .eq('user_id', user.id)
          .eq('access_type', 'active')
          .gt('expires_at', new Date().toISOString());
        
        if (!error && data) {
          const subscriptions: {[key: string]: boolean} = {};
          data.forEach(sub => {
            if (sub.modules && sub.modules.length > 0) {
              subscriptions[sub.modules[0].title] = true;
            }
          });
          setUserSubscriptions(subscriptions);
          console.log('✅ Sélections actives:', subscriptions);
        }
      } catch (error) {
        console.error('Erreur vérification sélections:', error);
      }
    };

    if (user) {
      checkUserSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    // Charger les modules depuis Supabase
    const fetchModules = async () => {
      try {
        console.log('=== DIAGNOSTIC SUPABASE ===');
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Anon Key présent:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        console.log('Client Supabase configuré:', !!supabase);
        
        // Test de connexion de base
        const { data: testData, error: testError } = await supabase
          .from('modules')
          .select('count')
          .limit(1);
        
        console.log('Test de connexion:', { testData, testError });
        
        console.log('Tentative de chargement des modules depuis Supabase...');
        
        // Récupérer les modules avec leurs catégories multiples
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select(`
            *,
            module_categories (
              category
            )
          `);
        
        console.log('Réponse Supabase complète:', { modulesData, modulesError });
        
        if (modulesError) {
          console.error('=== ERREUR DÉTAILLÉE ===');
          console.error('Erreur lors du chargement des modules:', modulesError);
          console.error('Code d\'erreur:', modulesError.code);
          console.error('Message d\'erreur:', modulesError.message);
          console.error('Détails:', modulesError.details);
          console.error('Hint:', modulesError.hint);
        } else {
          console.log('Modules chargés avec succès:', modulesData);
          
          // Traiter les modules avec leurs catégories multiples
          const modulesWithRoles = (modulesData || []).map(module => {
            // Extraire les catégories depuis la relation module_categories
            const categories = module.module_categories?.map((mc: any) => mc.category) || [];
            
            // Garder la catégorie principale pour la compatibilité
            const primaryCategory = module.category || categories[0] || 'Non classé';
            
            return {
              ...module,
              // Catégorie principale (pour compatibilité)
              category: cleanCategory(primaryCategory),
              // Nouvelles catégories multiples
              categories: categories.map(cleanCategory),
              // Ajouter des données aléatoires seulement pour l'affichage (pas stockées en DB)
              role: getRandomRole(),
              usage_count: Math.floor(Math.random() * 1000) + 1,
              profession: getModuleProfession(module.title, primaryCategory) // CHANGÉ : attribution intelligente
            };
          });
          
          setModules(modulesWithRoles);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModules();
  }, []);

  useEffect(() => {
    // Charger le rôle de l'utilisateur
    const fetchUserRole = async () => {
      if (session && user) {
        console.log('Chargement du rôle pour:', user.email, 'ID:', user.id);
        
        try {
          // Essayer d'abord de récupérer depuis auth.users (plus fiable)
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError) {
            console.warn('Erreur lors du chargement depuis auth:', authError);
            setRole('user'); // Rôle par défaut
          } else {
            const userRole = authData.user?.user_metadata?.role || 'user';
            console.log('Rôle récupéré depuis auth.users:', userRole);
            setRole(userRole);
          }
        } catch (err) {
          console.error('Erreur inattendue lors du chargement du rôle:', err);
          setRole('user'); // Rôle par défaut
        }
      } else {
        console.log('Pas de session ou utilisateur:', { session: !!session, user: !!user });
        setRole(null);
      }
    };
    
    fetchUserRole();
  }, [session, user]);

  useEffect(() => {
    // Charger les modules sélectionnés depuis le localStorage
    const saved = localStorage.getItem('selectedModules');
    if (saved) {
      try {
        setSelectedModules(JSON.parse(saved));
      } catch {
        setSelectedModules([]);
      }
    }
  }, []);

  const handleSubscribe = (module: any) => {
    const isSelected = selectedModules.some(m => m.id === module.id);
    let newSelectedModules;
    
    if (isSelected) {
      // Désabonner
      newSelectedModules = selectedModules.filter(m => m.id !== module.id);
      console.log('Désabonnement de:', module.title);
    } else {
      // S'abonner
      newSelectedModules = [...selectedModules, module];
      console.log('Abonnement à:', module.title);
    }
    
    console.log('Nouveaux modules sélectionnés:', newSelectedModules);
    setSelectedModules(newSelectedModules);
    localStorage.setItem('selectedModules', JSON.stringify(newSelectedModules));
    console.log('localStorage mis à jour');
  };

  const isModuleSelected = (moduleId: string) => {
    return selectedModules.some(module => module.id === moduleId);
  };

  // Fonction pour convertir en majuscules
  const toUpperCase = (str: string) => str.toUpperCase();

  // Fonction pour nettoyer les catégories supprimées
  const cleanCategory = (category: string) => {
    return category.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  };

  // Fonction pour attribuer une profession selon le nom du module
  const getModuleProfession = (moduleTitle: string, moduleCategory: string) => {
    const title = moduleTitle.toLowerCase();
    const category = moduleCategory.toLowerCase();

    // Photographes
    if (title.includes('photo') || title.includes('image') || title.includes('camera') || 
        title.includes('photoshop') || title.includes('lightroom') || title.includes('canon') ||
        title.includes('nikon') || title.includes('sony') || category.includes('photo')) {
      return 'Photographe';
    }

    // Rédacteurs & Journalistes
    if (title.includes('chatgpt') || title.includes('rédaction') || title.includes('texte') ||
        title.includes('word') || title.includes('notion') || title.includes('écriture') ||
        title.includes('article') || title.includes('blog') || category.includes('assistant')) {
      return 'Rédacteur';
    }

    // Architectes & Designers d'intérieur
    if (title.includes('autocad') || title.includes('sketchup') || title.includes('revit') ||
        title.includes('3d') || title.includes('blender') || title.includes('design') ||
        title.includes('architecture') || title.includes('maquette') || category.includes('design')) {
      return 'Architecte';
    }

    // Avocats & Juristes
    if (title.includes('droit') || title.includes('juridique') || title.includes('contrat') ||
        title.includes('legal') || title.includes('avocat') || title.includes('justice') ||
        title.includes('loi') || title.includes('procédure')) {
      return 'Avocat';
    }

    // Médecins & Professionnels de santé
    if (title.includes('médical') || title.includes('santé') || title.includes('diagnostic') ||
        title.includes('radiologie') || title.includes('analyse') || title.includes('patient') ||
        title.includes('clinique') || title.includes('hôpital')) {
      return 'Médecin';
    }

    // Par défaut, attribuer selon la catégorie
    if (category.includes('photo') || category.includes('image')) return 'Photographe';
    if (category.includes('assistant') || category.includes('texte')) return 'Rédacteur';
    if (category.includes('design') || category.includes('3d')) return 'Architecte';
    if (category.includes('bureautique') || category.includes('document')) return 'Rédacteur';
    if (category.includes('video') || category.includes('montage')) return 'Photographe';

    // Fallback aléatoire pour les modules non classés
    const professions = ['Photographe', 'Rédacteur', 'Architecte', 'Avocat', 'Médecin'];
    return professions[Math.floor(Math.random() * professions.length)];
  };

  // Fonctions pour générer des données aléatoires
  const getRandomRole = () => {
    const roles = ['Développeur', 'Designer', 'Marketing', 'Business', 'Étudiant', 'Freelance'];
    return roles[Math.floor(Math.random() * roles.length)];
  };

  // Générer la liste des catégories disponibles
  const existingCategories = Array.from(new Set(
    modules.flatMap(module => module.categories || [module.category]).filter(Boolean)
  ));

  // Catégories autorisées (mise à jour avec les nouvelles catégories)
  const authorizedCategories = [
    'IA ASSISTANT', 
    'IA BUREAUTIQUE', 
    'IA PHOTO', 
    'IA VIDEO', 
    'IA AUDIO', 
    'IA PROMPTS', 
    'IA MARKETING', 
    'IA DESIGN', 
    'Web Tools', 
    'IA FORMATION', 
    'IA DEVELOPPEMENT',
  ];

  // Filtrer et combiner les catégories
  const filteredExistingCategories = existingCategories.filter(cat => authorizedCategories.includes(cat));
  const missingCategories = authorizedCategories.filter(cat => !filteredExistingCategories.includes(cat));
  const allCategories = [...filteredExistingCategories, ...missingCategories];

  // Ajouter "Toutes les catégories" au début
  const categories = ['Toutes les catégories', ...allCategories];

  // Filtrer et trier les modules
  const filteredAndSortedModules = modules
    .filter(module => {
      // Filtre de recherche
      const matchesSearch = !search || 
        module.title.toLowerCase().includes(search.toLowerCase()) ||
        module.description?.toLowerCase().includes(search.toLowerCase()) ||
        (module.categories || [module.category]).some((cat: string) =>
          cat.toLowerCase().includes(search.toLowerCase())
        );

      // Filtre de prix
      const matchesPrice = priceFilter === 'all' || 
        (priceFilter === 'free' && module.price === '0') ||
        (priceFilter === 'paid' && module.price !== '0');

      // CHANGÉ : matchesExperience -> matchesProfession
      const matchesProfession = professionFilter === 'all' || 
        module.profession === professionFilter;

      // Filtre de catégorie
      const matchesCategory = categoryFilter === 'all' || 
        (module.categories || [module.category]).includes(categoryFilter);

      return matchesSearch && matchesPrice && matchesProfession && matchesCategory;
    })
    .sort((a, b) => {
      // Tri principal : modules gratuits en premier, puis modules payants
      const aIsFree = a.price === '0';
      const bIsFree = b.price === '0';
      
      if (aIsFree && !bIsFree) return -1; // a (gratuit) avant b (payant)
      if (!aIsFree && bIsFree) return 1;  // b (gratuit) avant a (payant)
      
      // Si les deux modules ont le même type (gratuit ou payant), appliquer le tri secondaire
      switch (sortBy) {
        case 'most_used':
          return (b.usage_count || 0) - (a.usage_count || 0);
        case 'least_used':
          return (a.usage_count || 0) - (b.usage_count || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'name_az':
          return a.title.localeCompare(b.title);
        case 'name_za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const modulesPerPage = 9;
  
  // Calculer les indices pour la pagination
  const indexOfLastModule = currentPage * modulesPerPage;
  const indexOfFirstModule = indexOfLastModule - modulesPerPage;
  const currentModules = filteredAndSortedModules.slice(indexOfFirstModule, indexOfLastModule);
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredAndSortedModules.length / modulesPerPage);
  
  // Fonctions de navigation
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [search, priceFilter, professionFilter, sortBy, categoryFilter]); // CHANGÉ : experienceFilter -> professionFilter

  // Détecter le scroll pour afficher/masquer le bouton de retour en haut
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour remonter en haut de page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <Breadcrumb />

      {/* Section héros */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Accès direct à la puissance et aux outils IA
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                L'essentiel de l'IA réuni pour une utilisation simple et directe.
              </p>
              
              {/* Barre de recherche et bouton Mes applis */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Applis"
                    className="w-full px-6 py-4 pl-12 pr-16 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/70">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </div>
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                    Rechercher
                  </button>
                </div>
                
                {/* Bouton Mes applications - Visible seulement si connecté */}
                {session && (
                  <Link 
                    href="/encours" 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-semibold px-6 py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[160px]"
                  >
                    <span className="text-lg">📱</span>
                    <span className="hidden sm:inline">Mes applications</span>
                    <span className="sm:hidden">Mes applications</span>
                  </Link>
                )}
              </div>
            </div>
            
            {/* Illustration */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-yellow-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Éléments centraux */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-left">
                    <div className="text-5xl font-bold text-white/30 mb-3">AI</div>
                    <div className="text-xs text-white/70">Intelligence Artificielle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale avec filtres et contenu */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar gauche - Catégories */}
            <aside className="lg:w-64 shrink-0 order-2 lg:order-1">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button 
                      key={cat} 
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        categoryFilter === (cat === 'Toutes les catégories' ? 'all' : cat)
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                      }`}
                      onClick={() => setCategoryFilter(cat === 'Toutes les catégories' ? 'all' : cat)}
                    >
                      {cat === 'Toutes les catégories' ? 'Toutes' : toUpperCase(cleanCategory(cat))}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1 order-1 lg:order-2">
              {/* Filtres */}
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
                  {/* Dropdowns */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 flex-1">
                    <select 
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                    >
                      <option value="all">Gratuit et payant</option>
                      <option value="free">Gratuit uniquement</option>
                      <option value="paid">Payant uniquement</option>
                    </select>
                    
                    {/* CHANGÉ : Filtre par métier traditionnel au lieu de niveau d'expérience */}
                    <select 
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={professionFilter}
                      onChange={(e) => setProfessionFilter(e.target.value)}
                    >
                      <option value="all">Tous les métiers</option>
                      <option value="Photographe">📸 Photographes</option>
                      <option value="Rédacteur">✍️ Rédacteurs & Journalistes</option>
                      <option value="Architecte">🏗️ Architectes & Designers</option>
                      <option value="Avocat">⚖️ Avocats & Juristes</option>
                      <option value="Médecin">🩺 Médecins & Santé</option>
                    </select>
                  </div>
                  
                  {/* Boutons */}
                  <div className="flex items-center gap-3">
                    <select 
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="most_used">Trier par : Plus installés</option>
                      <option value="least_used">Trier par : Moins installés</option>
                      <option value="price_high">Trier par : Prix élevé à bas</option>
                      <option value="price_low">Trier par : Prix bas à élevé</option>
                      <option value="name_az">Trier par : Nom A-Z</option>
                      <option value="name_za">Trier par : Nom Z-A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grille de templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-left py-12">
                    <div className="text-gray-500">Chargement des templates...</div>
                  </div>
                ) : filteredAndSortedModules.length === 0 ? (
                  <div className="col-span-full text-left py-12">
                    <div className="text-gray-500">Aucun template trouvé pour "{search}"</div>
                  </div>
                ) : currentModules.length === 0 ? (
                  <div className="col-span-full text-left py-12">
                    <div className="text-gray-500">Aucun module à afficher (currentModules vide)</div>
                    <div className="text-sm text-gray-400 mt-2">Total modules: {filteredAndSortedModules.length}</div>
                  </div>
                ) : (
                  currentModules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      userEmail={user?.email}
                    />
                  ))
                )}
              </div>
              
              {/* Contrôles de pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Précédent
                  </button>
                  
                  {/* Numéros de pages */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      // Afficher seulement quelques pages autour de la page actuelle
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <span key={pageNumber} className="px-2 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              )}
              
              {/* Informations de pagination */}
              {filteredAndSortedModules.length > 0 && (
                <div className="text-left text-gray-600 text-sm mt-4">
                  Affichage de {indexOfFirstModule + 1} à {Math.min(indexOfLastModule, filteredAndSortedModules.length)} sur {filteredAndSortedModules.length} templates
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bouton de retour en haut */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="Retour en haut"
          aria-label="Retour en haut de page"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M4.5 15.75l7.5-7.5 7.5 7.5" 
            />
          </svg>
        </button>
      )}

      {/* Bouton flottant de gestion des modules seulement pour les admins */}
      {session && role === 'admin' && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-110"
            title="Administration du site"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
