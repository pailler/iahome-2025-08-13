-- Création du module Metube
INSERT INTO modules (
  title,
  description,
  subtitle,
  category,
  price,
  youtube_url,
  features,
  requirements,
  installation_steps,
  usage_examples,
  documentation_url,
  github_url,
  demo_url,
  role,
  experience_level,
  usage_count
) VALUES (
  'Metube',
  'Plateforme de téléchargement et de gestion de vidéos YouTube avec interface moderne et fonctionnalités avancées.',
  'Téléchargez et gérez vos vidéos YouTube en toute simplicité',
  'IA VIDEO',
  0,
  'https://www.youtube.com/embed/inW3l-DpA7U?rel=0&modestbranding=1',
  ARRAY[
    'Téléchargement de vidéos YouTube',
    'Conversion de formats',
    'Gestion de playlists',
    'Interface moderne et intuitive',
    'Support de multiples qualités',
    'Téléchargement en arrière-plan'
  ],
  ARRAY[
    'Navigateur web moderne',
    'Connexion internet stable',
    'Espace disque suffisant'
  ],
  ARRAY[
    'Accédez à l''application via le bouton "Accéder à l''appli"',
    'Collez l''URL de la vidéo YouTube',
    'Sélectionnez la qualité souhaitée',
    'Cliquez sur télécharger'
  ],
  ARRAY[
    'Téléchargement de vidéos éducatives',
    'Sauvegarde de contenus favoris',
    'Conversion pour visionnage hors ligne'
  ],
  'https://metube.regispailler.fr/docs',
  'https://github.com/metube/metube',
  'https://metube.regispailler.fr/demo',
  'Utilisateur',
  'Débutant',
  150
) ON CONFLICT (title) DO NOTHING;

-- Vérification de l'insertion
SELECT 
  id,
  title,
  price,
  category
FROM modules 
WHERE title = 'Metube'; 