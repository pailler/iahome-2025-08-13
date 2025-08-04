const fs = require('fs');
const path = require('path');

// Fonction pour nettoyer les références à 'cartes' dans un fichier
function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remplacer les références à 'cartes' par 'modules'
    const replacements = [
      { from: /from\('cartes'\)/g, to: "from('modules')" },
      { from: /\.from\('cartes'\)/g, to: ".from('modules')" },
      { from: /cartes\./g, to: "modules." },
      { from: /'cartes'/g, to: "'modules'" },
      { from: /"cartes"/g, to: '"modules"' },
      { from: /\/admin\/cartes/g, to: "/admin/modules" },
      { from: /administration des cartes/g, to: "administration des modules" },
      { from: /gestion des cartes/g, to: "gestion des modules" },
      { from: /table cartes/g, to: "table modules" },
      { from: /Cartes sélectionnées/g, to: "Modules sélectionnés" },
      { from: /cartes sélectionnées/g, to: "modules sélectionnés" },
      { from: /Nouvelles cartes/g, to: "Nouveaux modules" },
      { from: /nouvelles cartes/g, to: "nouveaux modules" },
      { from: /Mapping des cartes/g, to: "Mapping des modules" },
      { from: /mapping des cartes/g, to: "mapping des modules" },
      { from: /liées aux cartes/g, to: "liées aux modules" },
      { from: /liés aux cartes/g, to: "liés aux modules" },
      { from: /référence aux cartes/g, to: "référence aux modules" },
      { from: /références aux cartes/g, to: "références aux modules" }
    ];
    
    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Nettoyé: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function cleanDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let cleanedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer node_modules et .git
      if (file !== 'node_modules' && file !== '.git') {
        cleanedCount += cleanDirectory(filePath);
      }
    } else if (stat.isFile()) {
      // Nettoyer seulement les fichiers pertinents
      const ext = path.extname(file);
      if (['.tsx', '.ts', '.js', '.jsx', '.md', '.sql'].includes(ext)) {
        if (cleanFile(filePath)) {
          cleanedCount++;
        }
      }
    }
  });
  
  return cleanedCount;
}

// Démarrer le nettoyage
console.log('🧹 Nettoyage des références à "cartes"...\n');

const startDir = './src';
const cleanedCount = cleanDirectory(startDir);

console.log(`\n✅ Nettoyage terminé ! ${cleanedCount} fichiers modifiés.`);
console.log('\n📋 Actions effectuées :');
console.log('- Remplacement de "cartes" par "modules" dans les requêtes Supabase');
console.log('- Mise à jour des chemins d\'administration');
console.log('- Correction des commentaires et descriptions');
console.log('- Nettoyage des références dans les interfaces et types'); 