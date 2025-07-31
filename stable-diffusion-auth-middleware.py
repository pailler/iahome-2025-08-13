#!/usr/bin/env python3
"""
Middleware d'authentification automatique pour Stable Diffusion
À ajouter dans l'application Stable Diffusion ou dans un reverse proxy
"""

import os
import sys
from flask import Flask, request, Response, redirect, url_for
from werkzeug.middleware.proxy_fix import ProxyFix
import logging

# Configuration
AUTO_AUTH_ENABLED = os.getenv('AUTO_AUTH_ENABLED', 'true').lower() == 'true'
AUTO_AUTH_USERNAME = os.getenv('AUTO_AUTH_USERNAME', 'admin')
AUTO_AUTH_PASSWORD = os.getenv('AUTO_AUTH_PASSWORD', 'Rasulova75')
AUTO_AUTH_HEADER = os.getenv('AUTO_AUTH_HEADER', 'X-Auto-Auth')
AUTO_AUTH_SECRET = os.getenv('AUTO_AUTH_SECRET', 'your-secret-key-change-this')

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

class AutoAuthMiddleware:
    """Middleware pour authentification automatique"""
    
    def __init__(self, app):
        self.app = app
        
    def __call__(self, environ, start_response):
        # Vérifier si l'authentification automatique est activée
        if not AUTO_AUTH_ENABLED:
            return self.app(environ, start_response)
        
        # Vérifier le header d'authentification automatique
        auth_header = environ.get(f'HTTP_{AUTO_AUTH_HEADER.replace("-", "_").upper()}')
        
        if auth_header == AUTO_AUTH_SECRET:
            logger.info("🔐 Authentification automatique détectée")
            
            # Simuler une session authentifiée
            environ['HTTP_AUTHORIZATION'] = f'Basic {self._encode_credentials()}'
            environ['REMOTE_USER'] = AUTO_AUTH_USERNAME
            
            # Ajouter des headers pour indiquer l'authentification automatique
            def custom_start_response(status, headers, exc_info=None):
                headers.append(('X-Auto-Authenticated', 'true'))
                headers.append(('X-Auto-Auth-User', AUTO_AUTH_USERNAME))
                return start_response(status, headers, exc_info)
            
            return self.app(environ, custom_start_response)
        
        return self.app(environ, start_response)
    
    def _encode_credentials(self):
        """Encoder les credentials en base64"""
        import base64
        credentials = f"{AUTO_AUTH_USERNAME}:{AUTO_AUTH_PASSWORD}"
        return base64.b64encode(credentials.encode()).decode()

# Routes pour l'authentification automatique
@app.route('/auto-auth/<secret>')
def auto_auth(secret):
    """Route pour activer l'authentification automatique"""
    if secret == AUTO_AUTH_SECRET:
        logger.info(f"🔐 Authentification automatique activée pour {request.remote_addr}")
        
        # Rediriger vers la page principale avec le header d'authentification
        response = redirect('/')
        response.headers[AUTO_AUTH_HEADER] = AUTO_AUTH_SECRET
        return response
    
    return "Accès refusé", 403

@app.route('/auth-status')
def auth_status():
    """Route pour vérifier le statut d'authentification"""
    return {
        'auto_auth_enabled': AUTO_AUTH_ENABLED,
        'username': AUTO_AUTH_USERNAME,
        'header_name': AUTO_AUTH_HEADER,
        'remote_addr': request.remote_addr
    }

# Configuration du middleware
app.wsgi_app = AutoAuthMiddleware(app.wsgi_app)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 7860))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"🚀 Middleware d'authentification automatique démarré sur le port {port}")
    logger.info(f"🔐 Authentification automatique: {'Activée' if AUTO_AUTH_ENABLED else 'Désactivée'}")
    logger.info(f"👤 Utilisateur par défaut: {AUTO_AUTH_USERNAME}")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 