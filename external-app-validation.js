// Script de validation des magic links pour l'application externe
// À intégrer dans votre application (metube.regispailler.fr, etc.)

const MAGIC_LINK_SECRET = 'your-magic-link-secret-change-this-in-production'; // Même secret que votre app principale

/**
 * Valider un magic link côté application externe
 */
async function validateMagicLink(token) {
  try {
    // Appeler l'API de validation de votre application principale
    const response = await fetch('https://votre-app-principale.com/api/validate-magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        valid: true,
        userData: data.magicLinkData
      };
    } else {
      return {
        valid: false,
        error: data.error
      };
    }
  } catch (error) {
    console.error('Erreur validation magic link:', error);
    return {
      valid: false,
      error: 'Erreur de connexion'
    };
  }
}

/**
 * Vérifier les permissions d'un utilisateur
 */
function hasPermission(userData, permission) {
  return userData.permissions && userData.permissions.includes(permission);
}

/**
 * Authentifier l'utilisateur dans l'application externe
 */
function authenticateUser(userData) {
  // Stocker les informations d'authentification
  localStorage.setItem('authenticated_user', JSON.stringify({
    userId: userData.userId,
    moduleName: userData.moduleName,
    permissions: userData.permissions,
    authenticatedAt: new Date().toISOString()
  }));

  // Rediriger vers la page principale ou afficher le contenu
  console.log('✅ Utilisateur authentifié:', userData);
  
  // Exemple : masquer la page de login et afficher le contenu
  const loginForm = document.getElementById('login-form');
  const mainContent = document.getElementById('main-content');
  
  if (loginForm) loginForm.style.display = 'none';
  if (mainContent) mainContent.style.display = 'block';
}

/**
 * Vérifier l'authentification au chargement de la page
 */
function checkAuthentication() {
  const magicLink = new URLSearchParams(window.location.search).get('magic_link');
  
  if (magicLink) {
    console.log('🔍 Magic link détecté, validation en cours...');
    
    validateMagicLink(magicLink).then(result => {
      if (result.valid) {
        console.log('✅ Magic link valide, authentification...');
        authenticateUser(result.userData);
        
        // Nettoyer l'URL (optionnel)
        const url = new URL(window.location);
        url.searchParams.delete('magic_link');
        window.history.replaceState({}, '', url);
      } else {
        console.error('❌ Magic link invalide:', result.error);
        showError('Lien d\'accès invalide ou expiré');
      }
    });
  } else {
    // Vérifier si l'utilisateur est déjà authentifié
    const storedUser = localStorage.getItem('authenticated_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log('✅ Utilisateur déjà authentifié:', userData);
      authenticateUser(userData);
    } else {
      console.log('❌ Aucune authentification trouvée');
      showLoginForm();
    }
  }
}

/**
 * Afficher un message d'erreur
 */
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else {
    alert(message);
  }
}

/**
 * Afficher le formulaire de login
 */
function showLoginForm() {
  const loginForm = document.getElementById('login-form');
  const mainContent = document.getElementById('main-content');
  
  if (loginForm) loginForm.style.display = 'block';
  if (mainContent) mainContent.style.display = 'none';
}

/**
 * Déconnecter l'utilisateur
 */
function logout() {
  localStorage.removeItem('authenticated_user');
  window.location.reload();
}

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', checkAuthentication);

// Exposer les fonctions globalement pour les tests
window.validateMagicLink = validateMagicLink;
window.authenticateUser = authenticateUser;
window.logout = logout; 