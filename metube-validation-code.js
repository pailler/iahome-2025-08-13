// Code pour l'application Docker metube.regispailler.fr
// À intégrer dans ton application Docker

/**
 * Fonction de validation des magic links
 * À appeler quand un utilisateur accède à l'application
 */
async function validateMagicLink(token, userId, moduleName) {
  try {
    console.log('🔍 Validation magic link:', { token, userId, moduleName });
    
    // Appeler l'API de validation sur le serveur principal
    const response = await fetch(`https://home.regispailler.fr/api/validate-magic-link?token=${token}&user=${userId}&module=${moduleName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('🔍 Réponse validation:', data);
    
    if (data.valid) {
      console.log('✅ Accès validé pour:', data.data.userEmail);
      return {
        success: true,
        user: data.data.userId,
        email: data.data.userEmail,
        module: data.data.moduleName
      };
    } else {
      console.log('❌ Accès refusé:', data.error);
      return {
        success: false,
        error: data.error
      };
    }
  } catch (error) {
    console.error('❌ Erreur validation:', error);
    return {
      success: false,
      error: 'Erreur de connexion au serveur de validation'
    };
  }
}

/**
 * Fonction pour extraire les paramètres de l'URL
 */
function getUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    token: urlParams.get('token'),
    user: urlParams.get('user'),
    module: urlParams.get('module')
  };
}

/**
 * Fonction principale d'authentification
 * À appeler au chargement de l'application
 */
async function authenticateUser() {
  const { token, user, module } = getUrlParameters();
  
  // Si pas de magic link, afficher page de connexion
  if (!token || !user || !module) {
    console.log('🔍 Pas de magic link, affichage page de connexion');
    showLoginPage();
    return;
  }
  
  // Valider le magic link
  const validation = await validateMagicLink(token, user, module);
  
  if (validation.success) {
    console.log('✅ Utilisateur authentifié:', validation.email);
    showApplication(validation);
  } else {
    console.log('❌ Authentification échouée:', validation.error);
    showErrorPage(validation.error);
  }
}

/**
 * Afficher l'application pour l'utilisateur authentifié
 */
function showApplication(userData) {
  // Masquer la page de connexion
  const loginPage = document.getElementById('login-page');
  if (loginPage) loginPage.style.display = 'none';
  
  // Afficher l'application
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.style.display = 'block';
    appContainer.innerHTML = `
      <div class="welcome-message">
        <h1>Bienvenue sur IAmetube !</h1>
        <p>Connecté en tant que: ${userData.email}</p>
        <p>Module: ${userData.module}</p>
      </div>
      <!-- Ton contenu d'application ici -->
    `;
  }
}

/**
 * Afficher la page de connexion
 */
function showLoginPage() {
  const appContainer = document.getElementById('app-container');
  if (appContainer) appContainer.style.display = 'none';
  
  const loginPage = document.getElementById('login-page');
  if (loginPage) {
    loginPage.style.display = 'block';
    loginPage.innerHTML = `
      <div class="login-container">
        <h1>Accès IAmetube</h1>
        <p>Vous devez avoir un lien d'accès valide pour utiliser cette application.</p>
        <p>Contactez l'administrateur pour obtenir un accès.</p>
      </div>
    `;
  }
}

/**
 * Afficher la page d'erreur
 */
function showErrorPage(error) {
  const appContainer = document.getElementById('app-container');
  if (appContainer) appContainer.style.display = 'none';
  
  const loginPage = document.getElementById('login-page');
  if (loginPage) {
    loginPage.style.display = 'block';
    loginPage.innerHTML = `
      <div class="error-container">
        <h1>Erreur d'accès</h1>
        <p>${error}</p>
        <p>Vérifiez votre lien d'accès ou contactez l'administrateur.</p>
      </div>
    `;
  }
}

// Exemple d'utilisation avec Express.js
// Si tu utilises Express.js dans ton Docker :

/*
const express = require('express');
const app = express();

app.get('/', async (req, res) => {
  const { token, user, module } = req.query;
  
  if (!token || !user || !module) {
    return res.render('login', { error: 'Lien d\'accès invalide' });
  }
  
  const validation = await validateMagicLink(token, user, module);
  
  if (validation.success) {
    res.render('application', { user: validation });
  } else {
    res.render('error', { error: validation.error });
  }
});

app.listen(3000, () => {
  console.log('IAmetube démarré sur le port 3000');
});
*/

// Exemple d'utilisation avec PHP
// Si tu utilises PHP dans ton Docker :

/*
<?php
function validateMagicLink($token, $userId, $moduleName) {
    $url = "https://home.regispailler.fr/api/validate-magic-link?token=$token&user=$userId&module=$moduleName";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $data = json_decode($response, true);
    return $data;
}

$token = $_GET['token'] ?? '';
$user = $_GET['user'] ?? '';
$module = $_GET['module'] ?? '';

if (!$token || !$user || !$module) {
    include 'login.php';
    exit;
}

$validation = validateMagicLink($token, $user, $module);

if ($validation['valid']) {
    include 'application.php';
} else {
    include 'error.php';
}
?>
*/

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  authenticateUser();
}); 