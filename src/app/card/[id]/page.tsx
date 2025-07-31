'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

interface Card {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  youtube_url?: string;
  image_url?: string;
  features?: string[];
  requirements?: string[];
  installation_steps?: string[];
  usage_examples?: string[];
  documentation_url?: string;
  github_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);

  // Vérifier la session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Charger les cartes sélectionnées depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedCards');
    if (saved) {
      try {
        setSelectedCards(JSON.parse(saved));
      } catch {
        setSelectedCards([]);
      }
    }
  }, []);

  // Charger les détails de la carte
  useEffect(() => {
    const fetchCardDetails = async () => {
      if (!params.id) return;

      try {
        const { data, error } = await supabase
          .from('cartes')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Erreur lors du chargement de la carte:', error);
          router.push('/');
          return;
        }

        if (data) {
          setCard(data);
        }
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, [params.id, router]);

  const getModuleAccessUrl = async (moduleName: string) => {
    if (!session) {
      alert('Vous devez être connecté pour accéder à ce module');
      return;
    }

    try {
      const response = await fetch('/api/generate-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subscriptionId: `${moduleName.toLowerCase()}-sub-789`,
          moduleName: moduleName.toLowerCase(),
          userEmail: user.email,
          redirectUrl: `https://${moduleName.toLowerCase()}.regispailler.fr`
        }),
      });

      if (response.ok) {
        const { magicLinkUrl } = await response.json();
        console.log('🔗 Magic link généré:', magicLinkUrl);
        window.open(magicLinkUrl, '_blank');
      } else {
        console.error('Erreur lors de la génération du magic link');
        alert('Erreur lors de la génération du lien d\'accès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération du lien d\'accès');
    }
  };

  const handleSubscribe = (card: Card) => {
    const isSelected = selectedCards.some(c => c.id === card.id);
    let newSelectedCards;
    
    if (isSelected) {
      // Désabonner
      newSelectedCards = selectedCards.filter(c => c.id !== card.id);
      console.log('Désabonnement de:', card.title);
    } else {
      // S'abonner
      newSelectedCards = [...selectedCards, card];
      console.log('Abonnement à:', card.title);
    }
    
    console.log('Nouvelles cartes sélectionnées:', newSelectedCards);
    setSelectedCards(newSelectedCards);
    localStorage.setItem('selectedCards', JSON.stringify(newSelectedCards));
    console.log('localStorage mis à jour');
  };

  const isCardSelected = (cardId: string) => {
    return selectedCards.some(card => card.id === cardId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Carte non trouvée</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 pt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>Retour</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
                <span className="text-xl font-bold text-blue-900">IAhome</span>
              </div>
            </div>
            
            {session && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{user?.email}</span>
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
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* En-tête de la carte */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full mb-4">
                      {card.category?.toUpperCase() || 'BUILDING BLOCKS'}
                    </span>
                    <h1 className="text-4xl font-bold text-blue-900 mb-4">{card.title}</h1>
                    <p className="text-xl text-gray-600 leading-relaxed">{card.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-900 mb-2">€{card.price}</div>
                    <div className="text-sm text-gray-500">par mois</div>
                  </div>
                </div>

                {/* Vidéo YouTube SDNext */}
                <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/inW3l-DpA7U?rel=0&modestbranding=1"
                    title="SDNext - Stable Diffusion Next Generation - Démonstration"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Carte d'action */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-900 mb-2">€{card.price}</div>
                  <div className="text-sm text-gray-500">par mois</div>
                </div>

                <div className="space-y-4">
                  {/* Bouton d'abonnement */}
                  <button 
                    className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      isCardSelected(card.id)
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={() => handleSubscribe(card)}
                  >
                    <span>🔐</span>
                    <span>{isCardSelected(card.id) ? 'Sélectionné' : 'Choisir'}</span>
                  </button>

                  {!session && (
                    <p className="text-sm text-gray-500 text-center">
                      <Link href="/login" className="text-blue-600 hover:text-blue-800">
                        Connectez-vous
                      </Link> pour vous abonner
                    </p>
                  )}
                </div>
              </div>

              {/* Liens utiles */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Liens utiles</h3>
                <div className="space-y-3">
                  {card.documentation_url && (
                    <a 
                      href={card.documentation_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                      <span>Documentation</span>
                    </a>
                  )}
                  
                  {card.github_url && (
                    <a 
                      href={card.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                      <span>Code source</span>
                    </a>
                  )}
                  
                  {card.demo_url && (
                    <a 
                      href={card.demo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      <span>Démo en ligne</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Prérequis */}
              {card.requirements && card.requirements.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Prérequis</h3>
                  <div className="space-y-2">
                    {card.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Zones de contenu en pleine largeur sous la vidéo */}
      
      {/* Fonctionnalités - Pleine largeur */}
      {card.features && card.features.length > 0 && (
        <div className="bg-white border-t border-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Fonctionnalités principales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {card.features.map((feature, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exemples d'utilisation - Pleine largeur */}
      {card.usage_examples && card.usage_examples.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Exemples d'utilisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {card.usage_examples.map((example, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">Exemple {index + 1}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{example}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Étapes d'installation - Pleine largeur */}
      {card.installation_steps && card.installation_steps.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Installation</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {card.installation_steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Étape {index + 1}</h3>
                      <p className="text-gray-700 leading-relaxed text-lg">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone de détails du module - Pleine largeur */}
      <div className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Détails du module</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div className="text-center mb-8">
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                {card.description}
              </p>
            </div>
            
            {/* Description détaillée du module */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-center">À propos de {card.title}</h3>
              <div className="max-w-4xl mx-auto">
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  {card.title} est une solution avancée qui révolutionne la façon dont vous travaillez avec l'intelligence artificielle. 
                  Cette plateforme offre des fonctionnalités de pointe pour optimiser vos workflows et améliorer votre productivité.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Que vous soyez un développeur expérimenté ou un débutant, {card.title} s'adapte à vos besoins 
                  et vous accompagne dans tous vos projets d'IA.
                </p>
              </div>
            </div>

            {/* Avantages clés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">Performance</h4>
                <p className="text-gray-700 text-sm">
                  Optimisé pour des performances maximales avec une interface utilisateur intuitive et réactive.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h4 className="font-semibold text-green-800 mb-2">Sécurité</h4>
                <p className="text-gray-700 text-sm">
                  Sécurité de niveau entreprise avec authentification robuste et protection des données.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛠️</span>
                </div>
                <h4 className="font-semibold text-purple-800 mb-2">Flexibilité</h4>
                <p className="text-gray-700 text-sm">
                  Architecture modulaire permettant une personnalisation complète selon vos besoins.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="font-semibold text-orange-800 mb-2">Évolutivité</h4>
                <p className="text-gray-700 text-sm">
                  Évolue avec votre entreprise, de la startup à l'entreprise multinationale.
                </p>
              </div>
            </div>

            {/* Informations techniques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-center">Informations techniques</h3>
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Catégorie</div>
                    <div className="font-semibold text-gray-700">{card.category || 'BUILDING BLOCKS'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Prix</div>
                    <div className="font-semibold text-gray-700">€{card.price}/mois</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Type</div>
                    <div className="font-semibold text-gray-700">SaaS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Confirmer la(es) sélection(s) - Bannière bleue */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à activer vos sélections ?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Confirmez vos sélections et accédez à tous les outils IA
          </p>
          <button
            onClick={() => router.push('/abonnements')}
            className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors text-lg shadow-lg"
          >
            Confirmer la(es) sélection(s)
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-gray-500 text-sm">
            © 2025 iIAhome - Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
} 