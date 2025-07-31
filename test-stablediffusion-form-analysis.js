const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { JSDOM } = require('jsdom');

// Configuration
const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';
const CREDENTIALS = {
  username: 'admin',
  password: 'Rasulova75'
};

async function analyzeStableDiffusionPage() {
  console.log('🔍 Analyse de la page de connexion StableDiffusion...');
  
  try {
    // 1. Test d'accès direct
    console.log('\n📡 Test d\'accès direct...');
    const directResponse = await fetch(STABLEDIFFUSION_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`Status: ${directResponse.status}`);
    console.log(`Headers:`, Object.fromEntries(directResponse.headers.entries()));
    
    if (!directResponse.ok) {
      console.log('❌ Page non accessible directement');
      return;
    }
    
    const html = await directResponse.text();
    console.log(`✅ Page récupérée (${html.length} caractères)`);
    
    // 2. Analyse avec JSDOM
    console.log('\n🔍 Analyse de la structure HTML...');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Analyser les formulaires
    const forms = document.querySelectorAll('form');
    console.log(`\n📝 Formulaires trouvés: ${forms.length}`);
    
    forms.forEach((form, index) => {
      console.log(`\n--- Formulaire ${index + 1} ---`);
      console.log(`Action: ${form.action}`);
      console.log(`Method: ${form.method}`);
      console.log(`ID: ${form.id}`);
      console.log(`Class: ${form.className}`);
      
      // Analyser les inputs du formulaire
      const inputs = form.querySelectorAll('input');
      console.log(`Inputs: ${inputs.length}`);
      
      inputs.forEach((input, inputIndex) => {
        console.log(`  Input ${inputIndex + 1}:`);
        console.log(`    Type: ${input.type}`);
        console.log(`    Name: ${input.name}`);
        console.log(`    ID: ${input.id}`);
        console.log(`    Placeholder: ${input.placeholder}`);
        console.log(`    Autocomplete: ${input.autocomplete}`);
        console.log(`    Required: ${input.required}`);
        console.log(`    Value: ${input.value}`);
      });
      
      // Analyser les boutons
      const buttons = form.querySelectorAll('button, input[type="submit"]');
      console.log(`Boutons: ${buttons.length}`);
      
      buttons.forEach((button, buttonIndex) => {
        console.log(`  Bouton ${buttonIndex + 1}:`);
        console.log(`    Type: ${button.type}`);
        console.log(`    Text: ${button.textContent?.trim()}`);
        console.log(`    ID: ${button.id}`);
        console.log(`    Class: ${button.className}`);
      });
    });
    
    // Analyser tous les inputs de la page
    console.log('\n🔍 Tous les inputs de la page:');
    const allInputs = document.querySelectorAll('input');
    console.log(`Total inputs: ${allInputs.length}`);
    
    allInputs.forEach((input, index) => {
      console.log(`\nInput ${index + 1}:`);
      console.log(`  Type: ${input.type}`);
      console.log(`  Name: ${input.name}`);
      console.log(`  ID: ${input.id}`);
      console.log(`  Placeholder: ${input.placeholder}`);
      console.log(`  Autocomplete: ${input.autocomplete}`);
      console.log(`  Required: ${input.required}`);
      console.log(`  Value: ${input.value}`);
      console.log(`  Form: ${input.form ? 'Oui' : 'Non'}`);
      if (input.form) {
        console.log(`  Form Action: ${input.form.action}`);
        console.log(`  Form Method: ${input.form.method}`);
      }
    });
    
    // Chercher des patterns spécifiques
    console.log('\n🔍 Recherche de patterns spécifiques...');
    
    // Username patterns
    const usernamePatterns = [
      'input[name*="user" i]',
      'input[id*="user" i]',
      'input[placeholder*="user" i]',
      'input[autocomplete*="user" i]'
    ];
    
    usernamePatterns.forEach(pattern => {
      const elements = document.querySelectorAll(pattern);
      if (elements.length > 0) {
        console.log(`Pattern "${pattern}": ${elements.length} éléments trouvés`);
        elements.forEach((el, i) => {
          console.log(`  ${i + 1}. name="${el.name}" id="${el.id}" placeholder="${el.placeholder}"`);
        });
      }
    });
    
    // Password patterns
    const passwordPatterns = [
      'input[type="password"]',
      'input[name*="pass" i]',
      'input[id*="pass" i]',
      'input[placeholder*="pass" i]',
      'input[autocomplete*="pass" i]'
    ];
    
    passwordPatterns.forEach(pattern => {
      const elements = document.querySelectorAll(pattern);
      if (elements.length > 0) {
        console.log(`Pattern "${pattern}": ${elements.length} éléments trouvés`);
        elements.forEach((el, i) => {
          console.log(`  ${i + 1}. name="${el.name}" id="${el.id}" placeholder="${el.placeholder}"`);
        });
      }
    });
    
    // 3. Test de connexion directe
    console.log('\n🔐 Test de connexion directe...');
    
    // Trouver le formulaire de connexion
    const loginForm = Array.from(forms).find(form => {
      const hasUsername = form.querySelector('input[name*="user" i], input[id*="user" i]');
      const hasPassword = form.querySelector('input[type="password"], input[name*="pass" i]');
      return hasUsername && hasPassword;
    });
    
    if (loginForm) {
      console.log('✅ Formulaire de connexion identifié');
      console.log(`Action: ${loginForm.action}`);
      console.log(`Method: ${loginForm.method}`);
      
      // Construire les données de connexion
      const formData = new URLSearchParams();
      
      // Trouver les champs username et password
      const usernameField = loginForm.querySelector('input[name*="user" i], input[id*="user" i], input[placeholder*="user" i]');
      const passwordField = loginForm.querySelector('input[type="password"], input[name*="pass" i], input[placeholder*="pass" i]');
      
      if (usernameField && passwordField) {
        console.log(`Champ username: name="${usernameField.name}" id="${usernameField.id}"`);
        console.log(`Champ password: name="${passwordField.name}" id="${passwordField.id}"`);
        
        formData.append(usernameField.name || 'username', CREDENTIALS.username);
        formData.append(passwordField.name || 'password', CREDENTIALS.password);
        
        // Tentative de connexion
        const loginUrl = loginForm.action ? new URL(loginForm.action, STABLEDIFFUSION_URL).href : STABLEDIFFUSION_URL;
        
        console.log(`Tentative de connexion vers: ${loginUrl}`);
        
        const loginResponse = await fetch(loginUrl, {
          method: loginForm.method || 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': STABLEDIFFUSION_URL
          },
          body: formData.toString(),
          redirect: 'follow'
        });
        
        console.log(`Status de connexion: ${loginResponse.status}`);
        console.log(`Headers de réponse:`, Object.fromEntries(loginResponse.headers.entries()));
        
        const loginContent = await loginResponse.text();
        console.log(`Contenu de réponse: ${loginContent.length} caractères`);
        
        // Analyser si la connexion a réussi
        if (loginResponse.ok) {
          console.log('✅ Connexion réussie!');
          
          // Vérifier si on est redirigé vers une page différente
          const finalUrl = loginResponse.url;
          if (finalUrl !== STABLEDIFFUSION_URL) {
            console.log(`Redirection vers: ${finalUrl}`);
          }
          
          // Analyser le contenu de la page connectée
          const connectedDom = new JSDOM(loginContent);
          const connectedDoc = connectedDom.window.document;
          
          // Chercher des indicateurs de connexion réussie
          const successIndicators = [
            'logout',
            'déconnexion',
            'profile',
            'profil',
            'dashboard',
            'tableau de bord',
            'welcome',
            'bienvenue'
          ];
          
          const pageText = connectedDoc.body.textContent.toLowerCase();
          const foundIndicators = successIndicators.filter(indicator => 
            pageText.includes(indicator)
          );
          
          if (foundIndicators.length > 0) {
            console.log(`Indicateurs de connexion trouvés: ${foundIndicators.join(', ')}`);
          }
          
        } else {
          console.log('❌ Connexion échouée');
          
          // Analyser les messages d'erreur
          const errorDom = new JSDOM(loginContent);
          const errorDoc = errorDom.window.document;
          
          const errorMessages = errorDoc.querySelectorAll('.error, .alert, .message, [class*="error"], [class*="alert"]');
          if (errorMessages.length > 0) {
            console.log('Messages d\'erreur trouvés:');
            errorMessages.forEach((msg, i) => {
              console.log(`  ${i + 1}. ${msg.textContent?.trim()}`);
            });
          }
        }
        
      } else {
        console.log('❌ Champs username/password non trouvés dans le formulaire');
      }
    } else {
      console.log('❌ Aucun formulaire de connexion identifié');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  }
}

// Fonction pour tester l'API de bypass
async function testBypassAPI() {
  console.log('\n🔐 Test de l\'API de bypass...');
  
  try {
    const response = await fetch('http://localhost:3000/api/module-access', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        module: 'stablediffusion',
        method: 'form-injection'
      })
    });
    
    console.log(`Status API: ${response.status}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log(`Réponse API: ${result.length} caractères`);
      
      // Sauvegarder la réponse pour analyse
      const fs = require('fs');
      fs.writeFileSync('stablediffusion-bypass-response.html', result);
      console.log('✅ Réponse sauvegardée dans stablediffusion-bypass-response.html');
    } else {
      console.log('❌ Erreur API');
    }
    
  } catch (error) {
    console.error('❌ Erreur API:', error.message);
  }
}

// Exécution
async function main() {
  console.log('🚀 Démarrage de l\'analyse StableDiffusion...\n');
  
  await analyzeStableDiffusionPage();
  await testBypassAPI();
  
  console.log('\n✅ Analyse terminée');
}

// Vérifier les dépendances
try {
  require('jsdom');
  require('node-fetch');
  main();
} catch (error) {
  console.log('❌ Dépendances manquantes. Installez avec:');
  console.log('npm install jsdom node-fetch');
} 