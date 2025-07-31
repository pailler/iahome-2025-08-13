const fs = require('fs');
const path = require('path');

// Configuration des images pour chaque carte
const cardImages = {
  'SDNext': {
    filename: 'sdnext-interface.svg',
    title: 'SDNext - Stable Diffusion WebUI',
    description: 'Interface web moderne pour Stable Diffusion'
  },
  'IAmetube': {
    filename: 'iametube-interface.svg',
    title: 'IAmetube - Téléchargement IA',
    description: 'Téléchargement intelligent de vidéos'
  },
  'IAphoto': {
    filename: 'iaphoto-interface.svg',
    title: 'IAphoto - Édition Photo IA',
    description: 'Édition photo assistée par IA'
  },
  'IAvideo': {
    filename: 'iavideo-interface.svg',
    title: 'IAvideo - Création Vidéo IA',
    description: 'Création vidéo avec intelligence artificielle'
  },
  'Canvas Building Framework': {
    filename: 'canvas-framework.svg',
    title: 'Canvas Building Framework',
    description: 'Framework de construction d\'applications'
  }
};

function createSVGImage(cardName, config) {
  const colors = {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    background: '#1e293b',
    card: '#334155',
    text: '#ffffff',
    textSecondary: '#94a3b8'
  };

  const svg = `<svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond dégradé -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.background};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.card};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.background};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fond principal -->
  <rect width="800" height="450" fill="url(#bgGradient)"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="800" height="60" fill="url(#cardGradient)" opacity="0.8"/>
  <text x="20" y="35" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${colors.text}">${config.title}</text>
  
  <!-- Sidebar gauche -->
  <rect x="0" y="60" width="200" height="390" fill="url(#cardGradient)" opacity="0.6"/>
  
  <!-- Menu sidebar -->
  <text x="20" y="90" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${colors.primary}">Dashboard</text>
  <text x="20" y="115" font-family="Arial, sans-serif" font-size="12" fill="${colors.textSecondary}">Projects</text>
  <text x="20" y="135" font-family="Arial, sans-serif" font-size="12" fill="${colors.textSecondary}">Analytics</text>
  <text x="20" y="155" font-family="Arial, sans-serif" font-size="12" fill="${colors.textSecondary}">Settings</text>
  <text x="20" y="175" font-family="Arial, sans-serif" font-size="12" fill="${colors.textSecondary}">Help</text>
  
  <!-- Zone principale -->
  <rect x="220" y="80" width="560" height="350" fill="url(#cardGradient)" opacity="0.4" rx="8"/>
  
  <!-- Zone de contenu -->
  <rect x="240" y="100" width="520" height="80" fill="url(#cardGradient)" opacity="0.8" rx="6"/>
  <text x="260" y="125" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${colors.primary}">${config.description}</text>
  <text x="260" y="145" font-family="Arial, sans-serif" font-size="11" fill="${colors.textSecondary}">Interface moderne et intuitive pour une expérience utilisateur optimale</text>
  <text x="260" y="165" font-family="Arial, sans-serif" font-size="11" fill="${colors.textSecondary}">Technologies avancées et performances exceptionnelles</text>
  
  <!-- Paramètres -->
  <rect x="240" y="200" width="250" height="120" fill="url(#cardGradient)" opacity="0.6" rx="6"/>
  <text x="260" y="220" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${colors.primary}">Fonctionnalités</text>
  <text x="260" y="240" font-family="Arial, sans-serif" font-size="10" fill="${colors.textSecondary}">Interface responsive</text>
  <text x="260" y="255" font-family="Arial, sans-serif" font-size="10" fill="${colors.textSecondary}">API REST complète</text>
  <text x="260" y="270" font-family="Arial, sans-serif" font-size="10" fill="${colors.textSecondary}">Support multi-utilisateurs</text>
  <text x="260" y="285" font-family="Arial, sans-serif" font-size="10" fill="${colors.textSecondary}">Sécurité avancée</text>
  <text x="260" y="300" font-family="Arial, sans-serif" font-size="10" fill="${colors.textSecondary}">Performance optimisée</text>
  
  <!-- Bouton Action -->
  <rect x="510" y="200" width="120" height="40" fill="url(#accentGradient)" rx="6"/>
  <text x="570" y="225" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${colors.text}" text-anchor="middle">Démarrer</text>
  
  <!-- Zone de résultat -->
  <rect x="240" y="340" width="520" height="80" fill="url(#cardGradient)" opacity="0.6" rx="6"/>
  <text x="260" y="360" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${colors.primary}">Résultats</text>
  
  <!-- Éléments décoratifs - particules d'IA -->
  <circle cx="50" cy="250" r="2" fill="${colors.primary}" opacity="0.6">
    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="750" cy="150" r="1.5" fill="${colors.primary}" opacity="0.4">
    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="700" cy="300" r="1" fill="${colors.primary}" opacity="0.5">
    <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="100" cy="400" r="1.5" fill="${colors.primary}" opacity="0.3">
    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  
  <!-- Icônes d'IA -->
  <g transform="translate(720, 100)">
    <circle cx="0" cy="0" r="15" fill="url(#accentGradient)" opacity="0.8"/>
    <text x="0" y="5" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${colors.text}" text-anchor="middle">AI</text>
  </g>
  
  <!-- Barre de progression -->
  <rect x="240" y="320" width="520" height="4" fill="#374151" rx="2"/>
  <rect x="240" y="320" width="260" height="4" fill="url(#accentGradient)" rx="2">
    <animate attributeName="width" values="0;260;520;260" dur="4s" repeatCount="indefinite"/>
  </rect>
  
  <!-- Indicateurs de statut -->
  <circle cx="780" cy="30" r="6" fill="#10b981"/>
  <text x="790" y="35" font-family="Arial, sans-serif" font-size="10" fill="${colors.text}">Ready</text>
</svg>`;

  return svg;
}

function createAllImages() {
  console.log('🎨 Création des images SVG pour toutes les cartes...\n');

  const imagesDir = path.join(__dirname, 'public', 'images');
  
  // Créer le dossier images s'il n'existe pas
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  Object.entries(cardImages).forEach(([cardName, config]) => {
    const svg = createSVGImage(cardName, config);
    const filePath = path.join(imagesDir, config.filename);
    
    fs.writeFileSync(filePath, svg);
    console.log(`✅ Image créée: ${config.filename} pour ${cardName}`);
  });

  console.log('\n🎉 Toutes les images SVG ont été créées !');
  console.log('📁 Dossier: public/images/');
  console.log('🔗 URLs: /images/[nom-fichier].svg');
}

// Exécuter le script
createAllImages(); 