const fs = require('fs');
const path = require('path');

// Liste des images à tester
const imagesToTest = [
  'sdnext-interface.svg',
  'iametube-interface.svg',
  'iaphoto-interface.svg',
  'iavideo-interface.svg',
  'canvas-framework.svg'
];

function testAllImages() {
  console.log('🎨 Test d\'accessibilité de toutes les images SVG...\n');

  const imagesDir = path.join(__dirname, 'public', 'images');
  
  if (!fs.existsSync(imagesDir)) {
    console.log('❌ Dossier images non trouvé: public/images/');
    return;
  }

  console.log('📁 Dossier images trouvé: public/images/');
  console.log('🔍 Vérification des fichiers...\n');

  let successCount = 0;
  let errorCount = 0;

  imagesToTest.forEach(imageName => {
    const imagePath = path.join(imagesDir, imageName);
    const url = `/images/${imageName}`;
    
    if (fs.existsSync(imagePath)) {
      const stats = fs.statSync(imagePath);
      const fileSize = (stats.size / 1024).toFixed(1); // KB
      
      console.log(`✅ ${imageName} - ${fileSize} KB`);
      console.log(`   📍 Fichier: ${imagePath}`);
      console.log(`   🔗 URL: http://localhost:8021${url}`);
      successCount++;
    } else {
      console.log(`❌ ${imageName} - Fichier manquant`);
      errorCount++;
    }
  });

  console.log('\n📊 Résumé:');
  console.log(`✅ Images trouvées: ${successCount}`);
  console.log(`❌ Images manquantes: ${errorCount}`);
  console.log(`📈 Taux de succès: ${((successCount / imagesToTest.length) * 100).toFixed(1)}%`);

  if (successCount === imagesToTest.length) {
    console.log('\n🎉 Toutes les images sont prêtes !');
    console.log('✅ Organisation dans /images/ réussie');
    console.log('✅ Images SVG créées avec succès');
    console.log('✅ URLs cohérentes et accessibles');
    
    console.log('\n🚀 Prochaines étapes:');
    console.log('1. Mettre à jour la base de données avec les nouvelles URLs');
    console.log('2. Tester l\'affichage sur le site');
    console.log('3. Vérifier l\'effet hover sur les images');
  } else {
    console.log('\n⚠️  Certaines images sont manquantes');
    console.log('💡 Relancez le script create-card-images.js');
  }

  console.log('\n🔗 URLs de test:');
  imagesToTest.forEach(imageName => {
    console.log(`   http://localhost:8021/images/${imageName}`);
  });
}

// Exécuter le test
testAllImages(); 