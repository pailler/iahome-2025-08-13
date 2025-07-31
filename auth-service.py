#!/usr/bin/env python3
"""
Service d'authentification automatique pour les modules IA
Ce service peut être déployé indépendamment ou intégré dans l'application
"""

import os
import base64
import logging
from flask import Flask, request, Response, redirect, url_for, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix
import requests
from datetime import datetime, timedelta

# Configuration
AUTH_SECRET = os.getenv('AUTH_SECRET', 'your-secret-key-change-this')
TARGET_URL = os.getenv('TARGET_URL', 'http://localhost:7860')
AUTH_USERNAME = os.getenv('AUTH_USERNAME', 'admin')
AUTH_PASSWORD = os.getenv('AUTH_PASSWORD', 'Rasulova75')
AUTH_HEADER = os.getenv('AUTH_HEADER', 'X-Auto-Auth')

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

class AuthService:
    """Service d'authentification automatique"""
    
    def __init__(self):
        self.credentials = base64.b64encode(f"{AUTH_USERNAME}:{AUTH_PASSWORD}".encode()).decode()
        self.sessions = {}  # Stockage des sessions actives
    
    def create_session(self, client_ip):
        """Créer une session d'authentification"""
        session_id = base64.b64encode(f"{client_ip}:{datetime.now().isoformat()}".encode()).decode()
        self.sessions[session_id] = {
            'ip': client_ip,
            'created': datetime.now(),
            'expires': datetime.now() + timedelta(hours=24)
        }
        return session_id
    
    def validate_session(self, session_id):
        """Valider une session"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            if datetime.now() < session['expires']:
                return True
            else:
                del self.sessions[session_id]
        return False
    
    def cleanup_expired_sessions(self):
        """Nettoyer les sessions expirées"""
        now = datetime.now()
        expired = [sid for sid, session in self.sessions.items() if now > session['expires']]
        for sid in expired:
            del self.sessions[sid]

auth_service = AuthService()

@app.route('/')
def index():
    """Page d'accueil du service d'authentification"""
    return jsonify({
        'service': 'Auto-Auth Service',
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'active_sessions': len(auth_service.sessions)
    })

@app.route('/auth/<secret>')
def authenticate(secret):
    """Route d'authentification avec secret"""
    if secret != AUTH_SECRET:
        return jsonify({'error': 'Secret invalide'}), 403
    
    client_ip = request.remote_addr
    session_id = auth_service.create_session(client_ip)
    
    logger.info(f"🔐 Session créée pour {client_ip}: {session_id}")
    
    # Rediriger vers la cible avec les headers d'authentification
    response = redirect(TARGET_URL)
    response.headers[AUTH_HEADER] = session_id
    response.headers['Authorization'] = f'Basic {auth_service.credentials}'
    
    return response

@app.route('/proxy/<path:subpath>')
def proxy_request(subpath):
    """Proxy les requêtes vers la cible avec authentification"""
    session_id = request.headers.get(AUTH_HEADER)
    
    if not session_id or not auth_service.validate_session(session_id):
        return jsonify({'error': 'Session invalide ou expirée'}), 401
    
    # Construire l'URL de destination
    target_url = f"{TARGET_URL}/{subpath}"
    
    # Headers pour la requête
    headers = {
        'Authorization': f'Basic {auth_service.credentials}',
        'X-Auto-Authenticated': 'true',
        'X-Auto-Auth-User': AUTH_USERNAME
    }
    
    # Copier les headers de la requête originale
    for header, value in request.headers.items():
        if header.lower() not in ['host', 'content-length']:
            headers[header] = value
    
    try:
        # Faire la requête vers la cible
        if request.method == 'GET':
            resp = requests.get(target_url, headers=headers, params=request.args)
        elif request.method == 'POST':
            resp = requests.post(target_url, headers=headers, data=request.get_data())
        else:
            return jsonify({'error': 'Méthode non supportée'}), 405
        
        # Retourner la réponse
        response = Response(resp.content, resp.status_code)
        for header, value in resp.headers.items():
            if header.lower() not in ['content-encoding', 'content-length']:
                response.headers[header] = value
        
        return response
        
    except requests.RequestException as e:
        logger.error(f"❌ Erreur proxy: {e}")
        return jsonify({'error': 'Erreur de connexion à la cible'}), 502

@app.route('/status')
def status():
    """Statut du service d'authentification"""
    auth_service.cleanup_expired_sessions()
    
    return jsonify({
        'service': 'Auto-Auth Service',
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        'active_sessions': len(auth_service.sessions),
        'target_url': TARGET_URL,
        'auth_header': AUTH_HEADER
    })

@app.route('/sessions')
def list_sessions():
    """Lister les sessions actives"""
    auth_service.cleanup_expired_sessions()
    
    sessions = []
    for session_id, session in auth_service.sessions.items():
        sessions.append({
            'session_id': session_id[:16] + '...',  # Masquer partiellement
            'ip': session['ip'],
            'created': session['created'].isoformat(),
            'expires': session['expires'].isoformat()
        })
    
    return jsonify({
        'sessions': sessions,
        'count': len(sessions)
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"🚀 Service d'authentification démarré sur le port {port}")
    logger.info(f"🎯 URL cible: {TARGET_URL}")
    logger.info(f"🔐 Header d'authentification: {AUTH_HEADER}")
    logger.info(f"👤 Utilisateur: {AUTH_USERNAME}")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 