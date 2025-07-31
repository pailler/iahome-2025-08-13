const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { JSDOM } = require('jsdom');
const fs = require('fs');

const STABLEDIFFUSION_URL = 'https://stablediffusion.regispailler.fr';

async function analyzePageContent() {
  console.log('🔍 Analyse approfondie de la page StableDiffusion...');
  
  try {
    const response = await fetch(STABLEDIFFUSION_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    console.log(`✅ Page récupérée (${html.length} caractères)`);
    
    // Sauvegarder le HTML pour analyse
    fs.writeFileSync('stablediffusion-page.html', html);
    console.log('✅ HTML sauvegardé dans stablediffusion-page.html');
    
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // 1. Analyser les scripts
    console.log('\n📜 Analyse des scripts JavaScript...');
    const scripts = document.querySelectorAll('script');
    console.log(`Scripts trouvés: ${scripts.length}`);
    
    scripts.forEach((script, index) => {
      console.log(`\n--- Script ${index + 1} ---`);
      console.log(`Type: ${script.type}`);
      console.log(`Src: ${script.src}`);
      console.log(`Inline: ${script.innerHTML ? 'Oui' : 'Non'}`);
      
      if (script.innerHTML) {
        const content = script.innerHTML.substring(0, 200);
        console.log(`Contenu (200 premiers caractères): ${content}...`);
        
        // Chercher des mots-clés liés à l'authentification
        const authKeywords = ['login', 'auth', 'user', 'password', 'form', 'submit'];
        const lowerContent = script.innerHTML.toLowerCase();
        
        authKeywords.forEach(keyword => {
          if (lowerContent.includes(keyword)) {
            console.log(`  🔍 Mot-clé "${keyword}" trouvé dans le script`);
          }
        });
      }
    });
    
    // 2. Analyser les éléments avec des IDs ou classes intéressants
    console.log('\n🔍 Recherche d\'éléments d\'authentification...');
    
    const authSelectors = [
      '[id*="login"]',
      '[id*="auth"]',
      '[id*="user"]',
      '[class*="login"]',
      '[class*="auth"]',
      '[class*="user"]',
      '[data-*="login"]',
      '[data-*="auth"]'
    ];
    
    authSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`\nSélecteur "${selector}": ${elements.length} éléments`);
        elements.forEach((el, i) => {
          console.log(`  ${i + 1}. Tag: ${el.tagName}, ID: ${el.id}, Class: ${el.className}`);
          if (el.textContent) {
            const text = el.textContent.trim().substring(0, 100);
            console.log(`     Texte: ${text}...`);
          }
        });
      }
    });
    
    // 3. Analyser le body pour voir la structure générale
    console.log('\n📄 Structure générale de la page...');
    const body = document.body;
    if (body) {
      console.log(`Body classes: ${body.className}`);
      console.log(`Body ID: ${body.id}`);
      
      // Chercher des divs avec des classes intéressantes
      const interestingDivs = body.querySelectorAll('div[class*="login"], div[class*="auth"], div[class*="form"]');
      console.log(`Divs intéressants trouvés: ${interestingDivs.length}`);
      
      interestingDivs.forEach((div, i) => {
        console.log(`  Div ${i + 1}: class="${div.className}" id="${div.id}"`);
      });
    }
    
    // 4. Analyser les liens et boutons
    console.log('\n🔗 Analyse des liens et boutons...');
    const links = document.querySelectorAll('a');
    const buttons = document.querySelectorAll('button');
    
    console.log(`Liens trouvés: ${links.length}`);
    console.log(`Boutons trouvés: ${buttons.length}`);
    
    // Chercher des liens/boutons liés à l'authentification
    const authElements = [...links, ...buttons].filter(el => {
      const text = el.textContent?.toLowerCase() || '';
      const href = el.getAttribute('href') || '';
      const className = el.className?.toLowerCase() || '';
      
      return text.includes('login') || text.includes('connexion') || 
             text.includes('auth') || text.includes('sign') ||
             href.includes('login') || className.includes('login');
    });
    
    if (authElements.length > 0) {
      console.log(`\nÉléments d'authentification trouvés: ${authElements.length}`);
      authElements.forEach((el, i) => {
        console.log(`  ${i + 1}. Tag: ${el.tagName}, Texte: "${el.textContent?.trim()}", Href: "${el.getAttribute('href')}"`);
      });
    }
    
    // 5. Analyser les meta tags et title
    console.log('\n📋 Meta informations...');
    const title = document.querySelector('title');
    if (title) {
      console.log(`Titre: ${title.textContent}`);
    }
    
    const metaTags = document.querySelectorAll('meta');
    console.log(`Meta tags: ${metaTags.length}`);
    
    // 6. Chercher des patterns dans le HTML brut
    console.log('\n🔍 Recherche de patterns dans le HTML...');
    const htmlLower = html.toLowerCase();
    
    const patterns = [
      'login',
      'auth',
      'user',
      'password',
      'form',
      'submit',
      'signin',
      'signup',
      'register',
      'connexion',
      'authentification'
    ];
    
    patterns.forEach(pattern => {
      const matches = htmlLower.match(new RegExp(pattern, 'g'));
      if (matches) {
        console.log(`Pattern "${pattern}": ${matches.length} occurrences`);
      }
    });
    
    // 7. Analyser les styles CSS pour des indices
    console.log('\n🎨 Analyse des styles...');
    const styles = document.querySelectorAll('style');
    console.log(`Balises style: ${styles.length}`);
    
    styles.forEach((style, i) => {
      const content = style.textContent;
      if (content.includes('login') || content.includes('auth') || content.includes('form')) {
        console.log(`Style ${i + 1} contient des références d'authentification`);
      }
    });
    
    // 8. Vérifier s'il y a des iframes
    console.log('\n🖼️ Analyse des iframes...');
    const iframes = document.querySelectorAll('iframe');
    console.log(`Iframes trouvées: ${iframes.length}`);
    
    iframes.forEach((iframe, i) => {
      console.log(`  Iframe ${i + 1}: src="${iframe.src}"`);
    });
    
    // 9. Analyser les éléments avec des attributs data
    console.log('\n📊 Analyse des attributs data...');
    const dataElements = document.querySelectorAll('[data-*]');
    console.log(`Éléments avec attributs data: ${dataElements.length}`);
    
    const authDataElements = Array.from(dataElements).filter(el => {
      const attributes = el.attributes;
      for (let attr of attributes) {
        if (attr.name.startsWith('data-') && 
            (attr.value.includes('login') || attr.value.includes('auth') || attr.value.includes('user'))) {
          return true;
        }
      }
      return false;
    });
    
    if (authDataElements.length > 0) {
      console.log(`Éléments data liés à l'auth: ${authDataElements.length}`);
      authDataElements.forEach((el, i) => {
        console.log(`  ${i + 1}. Tag: ${el.tagName}, Attributs: ${Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  }
}

// Exécution
analyzePageContent().then(() => {
  console.log('\n✅ Analyse terminée');
}); 