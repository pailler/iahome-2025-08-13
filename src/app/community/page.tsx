'use client';

import { useEffect } from 'react';

export default function CommunityPage() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Article Header */}
      <div className="article-header">
        <div className="header-image">
          <img src="/images/communaute-ia-interface.svg" alt="Communauté IA collaborative" className="hero-image" />
        </div>
        <div className="header-overlay">
          <h1 className="hero-title">Construire une communauté IA engagée</h1>
          <p className="hero-subtitle">Créez et animez une communauté dynamique qui accélère l'adoption de l'IA</p>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="article-content">
          <h1 className="article-title">
            <span className="title-icon">👥</span>
            Construire une communauté IA engagée
          </h1>

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">🌟</span>
              <strong>Introduction</strong>
            </h2>
            <div className="paragraph-container">
              <div className="paragraph-icon">💡</div>
              <p className="paragraph">Une communauté IA forte est un atout majeur pour toute organisation souhaitant adopter l'intelligence artificielle. Elle favorise l'apprentissage collaboratif, le partage d'expériences et l'innovation collective. Découvrez comment créer et animer une communauté IA dynamique qui accélère la transformation numérique de votre entreprise.</p>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">🎯</span>
              <strong>Définir votre vision</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🎨</span>
                <strong>Objectifs de la communauté</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">📋</div>
                <p className="paragraph">Définissez clairement les objectifs de votre communauté IA. S'agit-il de favoriser l'apprentissage, de partager des bonnes pratiques, de développer des projets innovants ou de créer un réseau de professionnels ? Une vision claire guide les actions et motive les participants à s'engager activement.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">👥</span>
                <strong>Identifier votre audience</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🎯</div>
                <p className="paragraph">Identifiez les profils de participants potentiels : développeurs, data scientists, chefs de projet, utilisateurs métier. Comprenez leurs besoins, leurs motivations et leurs contraintes pour adapter le contenu et les activités de la communauté à leurs attentes spécifiques.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">🏗️</span>
              <strong>Structures et plateformes</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">💻</span>
                <strong>Plateformes numériques</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🌐</div>
                <p className="paragraph">Choisissez les plateformes adaptées à votre communauté : Slack pour les échanges quotidiens, Discord pour les discussions techniques, LinkedIn pour le networking professionnel, ou des forums dédiés pour les échanges approfondis. Assurez-vous que les outils facilitent l'interaction et l'engagement.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🏢</span>
                <strong>Événements en présentiel</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🎪</div>
                <p className="paragraph">Organisez des événements physiques pour renforcer les liens : meetups mensuels, hackathons, conférences internes, ateliers pratiques. Ces rencontres favorisent les échanges directs, le networking et la création de synergies entre les participants.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">📚</span>
              <strong>Contenu et activités</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🎓</span>
                <strong>Programmes de formation</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">📖</div>
                <p className="paragraph">Développez des programmes de formation adaptés aux différents niveaux : webinaires d'introduction, ateliers pratiques, cours avancés, certifications. Invitez des experts internes et externes à partager leurs connaissances et leurs expériences.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">💡</span>
                <strong>Partage d'expériences</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">📝</div>
                <p className="paragraph">Encouragez le partage d'expériences et de cas d'usage concrets. Organisez des sessions de retour d'expérience, des présentations de projets réussis, des discussions sur les défis rencontrés. Ces échanges enrichissent la communauté et évitent la répétition d'erreurs.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🚀</span>
                <strong>Projets collaboratifs</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🤝</div>
                <p className="paragraph">Lancez des projets collaboratifs qui mobilisent les compétences de différents membres. Hackathons, challenges de données, développement d'outils internes, recherche appliquée. Ces projets renforcent l'engagement et créent de la valeur pour l'organisation.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">👑</span>
              <strong>Leadership et animation</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🎭</span>
                <strong>Rôles et responsabilités</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">👨‍💼</div>
                <p className="paragraph">Définissez les rôles clés : animateur principal, modérateurs, experts techniques, ambassadeurs. Répartissez les responsabilités pour assurer une animation continue et de qualité. Formez les leaders aux techniques d'animation de communauté et de facilitation.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🎪</span>
                <strong>Techniques d'animation</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">🎯</div>
                <p className="paragraph">Utilisez des techniques d'animation variées : questions ouvertes, sondages, challenges, reconnaissances, gamification. Créez des rituels communautaires : café IA du lundi, défi technique du mois, showcase des projets. Ces éléments maintiennent l'engagement et la motivation.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">📊</span>
              <strong>Mesure et amélioration</strong>
            </h2>
            
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">📈</span>
                <strong>Métriques d'engagement</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">📊</div>
                <p className="paragraph">Mesurez l'engagement de votre communauté : nombre de participants actifs, fréquence des interactions, qualité des échanges, satisfaction des membres. Utilisez ces données pour identifier les points d'amélioration et adapter votre stratégie.</p>
              </div>
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="subsection-icon">🔄</span>
                <strong>Amélioration continue</strong>
              </h3>
              <div className="paragraph-container">
                <div className="paragraph-icon">⚡</div>
                <p className="paragraph">Collectez régulièrement les retours des membres pour améliorer l'expérience communautaire. Adaptez le contenu, les activités et les plateformes en fonction des besoins évolutifs. Testez de nouvelles approches et mesurez leur impact.</p>
              </div>
            </div>
          </div>

          <hr className="section-divider" />

          <div className="section">
            <h2 className="section-title">
              <span className="section-icon">🎉</span>
              <strong>Conclusion</strong>
            </h2>
            <div className="paragraph-container">
              <div className="paragraph-icon">🌟</div>
              <p className="paragraph">Une communauté IA bien structurée et animée devient un moteur puissant d'innovation et de transformation. En investissant dans la création de liens, le partage de connaissances et la collaboration, vous développez un écosystème qui accélère l'adoption de l'IA et maximise son impact sur votre organisation.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .article-header {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
          border-radius: 20px;
          margin-bottom: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .header-image {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.8);
        }

        .header-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 2rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: white;
          opacity: 0.9;
          max-width: 600px;
          line-height: 1.6;
        }

        .article-content {
          max-width: 100%;
          line-height: 1.8;
        }

        .article-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 2rem;
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .title-icon {
          font-size: 3rem;
          opacity: 0.8;
        }

        .section {
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding: 1rem 0;
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-icon {
          font-size: 1.5rem;
          opacity: 0.7;
        }

        .subsection {
          margin-bottom: 2rem;
          padding-left: 1rem;
        }

        .subsection-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .subsection-icon {
          font-size: 1.2rem;
          opacity: 0.6;
        }

        .paragraph-container {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .paragraph-icon {
          font-size: 1.5rem;
          opacity: 0.4;
          margin-top: 0.25rem;
          flex-shrink: 0;
          width: 2rem;
          text-align: center;
        }

        .paragraph {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #4b5563;
          text-align: justify;
          padding: 0.5rem 0;
          flex: 1;
        }

        .section-divider {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%);
          margin: 3rem 0;
          border-radius: 1px;
        }

        @media (max-width: 768px) {
          .article-header {
            height: 300px;
          }
          
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
          }
          
          .article-title {
            font-size: 2rem;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .title-icon {
            font-size: 2.5rem;
          }
          
          .section-title {
            font-size: 1.5rem;
          }
          
          .section-icon {
            font-size: 1.3rem;
          }
          
          .subsection-title {
            font-size: 1.2rem;
          }
          
          .subsection-icon {
            font-size: 1.1rem;
          }
          
          .paragraph {
            font-size: 1rem;
          }
          
          .paragraph-icon {
            font-size: 1.3rem;
          }
          
          .paragraph-container {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
} 