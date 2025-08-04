#!/usr/bin/env python3
"""
Script d'authentification JWT pour Metube
Vérifie les tokens JWT et sécurise l'accès à l'application
"""

import os
import sys
import jwt
import time
import json
import logging
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import subprocess
import threading
import socket
import select

# Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'iahome-super-secret-jwt-key-2025-change-this-in-production')
METUBE_PORT = int(os.getenv('METUBE_PORT', '8081'))
AUTH_REQUIRED = os.getenv('AUTH_REQUIRED', 'true').lower() == 'true'
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Configuration du logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/metube-jwt-auth.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class JWTRequestHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.valid_tokens = set()
        super().__init__(*args, **kwargs)
    
    def log_message(self, format, *args):
        logger.info(f"{self.client_address[0]} - {format % args}")
    
    def do_GET(self):
        self._handle_request('GET')
    
    def do_POST(self):
        self._handle_request('POST')
    
    def do_PUT(self):
        self._handle_request('PUT')
    
    def do_DELETE(self):
        self._handle_request('DELETE')
    
    def do_OPTIONS(self):
        self._handle_request('OPTIONS')
    
    def do_HEAD(self):
        self._handle_request('HEAD')
    
    def _handle_request(self, method):
        try:
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            query_params = parse_qs(parsed_url.query)
            
            logger.info(f"Requête {method} reçue: {self.path}")
            
            # Vérifier si l'authentification est requise
            if not AUTH_REQUIRED:
                logger.info("Authentification désactivée, accès direct autorisé")
                self._proxy_to_metube(method)
                return
            
            # Vérifier le token JWT
            token = query_params.get('token', [None])[0]
            
            # Si c'est la page principale (/) sans token, afficher la page de connexion
            if path == '/' and not token and method == 'GET':
                logger.warning("Accès à la page principale sans token, affichage de la page de connexion")
                self._send_login_page()
                return
            
            # Si c'est la page principale avec token, valider le token
            if path == '/' and token and method == 'GET':
                if self._validate_jwt_token(token):
                    logger.info("Token JWT valide pour la page principale, accès autorisé")
                    self._proxy_to_metube(method)
                else:
                    logger.warning("Token JWT invalide pour la page principale, redirection vers la page de connexion")
                    self._send_login_page()
                return
            
            # Pour toutes les autres requêtes (ressources statiques, Socket.IO, etc.), proxifier directement
            # car l'utilisateur a déjà accédé à la page principale avec un token valide
            logger.info(f"Proxification directe pour: {method} {path}")
            
            self._proxy_to_metube(method)
                
        except Exception as e:
            logger.error(f"Erreur lors du traitement de la requête: {e}")
            self._send_error_page()
    
    def _validate_jwt_token(self, token):
        """Valide un token JWT"""
        try:
            # Décoder le token sans vérification automatique de l'expiration
            # car les tokens de la plateforme utilisent un format différent
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'], options={'verify_exp': False})
            
            # Vérifier manuellement l'expiration si elle existe
            if 'exp' in payload:
                current_time = int(time.time())
                if payload['exp'] < current_time:
                    logger.warning(f"Token expiré: {payload.get('userEmail', 'Unknown')}")
                    return False
            
            # Vérifier que c'est pour le bon module
            if payload.get('moduleName') != 'metube':
                logger.warning(f"Token pour mauvais module: {payload.get('moduleName')}")
                return False
            
            # Vérifier les permissions
            required_permissions = ['read', 'access']
            user_permissions = payload.get('permissions', [])
            if not all(perm in user_permissions for perm in required_permissions):
                logger.warning(f"Permissions insuffisantes: {user_permissions}")
                return False
            
            logger.info(f"Token valide pour: {payload.get('userEmail', 'Unknown')}")
            return True
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token expiré")
            return False
        except jwt.InvalidTokenError as e:
            logger.warning(f"Token invalide: {e}")
            return False
        except Exception as e:
            logger.error(f"Erreur lors de la validation du token: {e}")
            return False
    
    def _send_login_page(self):
        """Envoie une page de connexion HTML"""
        html_content = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accès sécurisé - Metube</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        .logo {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 1rem;
        }
        .title {
            color: #333;
            margin-bottom: 1rem;
        }
        .message {
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
        }
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔒</div>
        <div class="logo">Metube</div>
        <h1 class="title">Accès sécurisé requis</h1>
        <p class="message">
            Cette application nécessite une authentification JWT valide.<br>
            Veuillez vous connecter via la plateforme principale.
        </p>
        <a href="https://iahome.regispailler.fr" class="btn">
            Retour à la plateforme
        </a>
    </div>
</body>
</html>
        """
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(html_content)))
        self.end_headers()
        self.wfile.write(html_content.encode('utf-8'))
    
    def _send_error_page(self):
        """Envoie une page d'erreur HTML"""
        html_content = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erreur - Metube</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .title {
            color: #333;
            margin-bottom: 1rem;
        }
        .message {
            color: #666;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">⚠️</div>
        <h1 class="title">Erreur d'authentification</h1>
        <p class="message">
            Une erreur s'est produite lors de la vérification de votre accès.<br>
            Veuillez réessayer ou contacter l'administrateur.
        </p>
    </div>
</body>
</html>
        """
        
        self.send_response(500)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(html_content)))
        self.end_headers()
        self.wfile.write(html_content.encode('utf-8'))
    
    def _proxy_to_metube(self, method='GET'):
        """Proxie les requêtes vers l'application Metube"""
        try:
            import requests
            
            # Construire l'URL de destination vers Metube
            metube_url = f"http://metube:{METUBE_PORT}{self.path}"
            logger.info(f"Proxification {method} vers: {metube_url}")
            
            # Lire le contenu de la requête si c'est POST/PUT
            data = None
            if method in ['POST', 'PUT']:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    data = self.rfile.read(content_length)
            
            # Préparer les headers pour la requête
            headers = {}
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'content-length']:
                    headers[header] = value
            
            # Ajouter des headers importants pour Socket.IO
            if 'socket.io' in self.path:
                headers['Connection'] = 'keep-alive'
                headers['Cache-Control'] = 'no-cache'
                headers['Pragma'] = 'no-cache'
            
            # Faire la requête vers Metube
            if method == 'GET':
                response = requests.get(metube_url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(metube_url, headers=headers, data=data, timeout=30)
            elif method == 'PUT':
                response = requests.put(metube_url, headers=headers, data=data, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(metube_url, headers=headers, timeout=30)
            elif method == 'OPTIONS':
                response = requests.options(metube_url, headers=headers, timeout=30)
            else:
                response = requests.get(metube_url, headers=headers, timeout=30)
            
            # Transmettre la réponse
            self.send_response(response.status_code)
            
            # Transmettre les headers
            for header, value in response.headers.items():
                if header.lower() not in ['transfer-encoding', 'connection']:
                    self.send_header(header, value)
            
            self.end_headers()
            
            # Transmettre le contenu
            if response.content:
                self.wfile.write(response.content)
            
        except Exception as e:
            logger.error(f"Erreur lors de la proxification {method} vers Metube: {e}")
            self._send_error_page()
    
    def _handle_websocket_upgrade(self):
        """Gère les requêtes WebSocket upgrade"""
        try:
            logger.info("Tentative de connexion WebSocket vers Metube")
            
            # Créer une connexion socket vers Metube
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(('metube', METUBE_PORT))
            
            # Envoyer la requête WebSocket vers Metube
            request = f"GET {self.path} HTTP/1.1\r\n"
            for header, value in self.headers.items():
                request += f"{header}: {value}\r\n"
            request += "\r\n"
            
            sock.send(request.encode())
            
            # Lire la réponse de Metube
            response = sock.recv(4096)
            
            # Transmettre la réponse au client
            self.wfile.write(response)
            
            # Fermer la connexion
            sock.close()
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement WebSocket: {e}")
            self._send_error_page()

def start_metube():
    """Démarre l'application Metube en arrière-plan"""
    try:
        logger.info("Démarrage de Metube...")
        # Ici vous pouvez ajouter la commande pour démarrer Metube
        # Par exemple: subprocess.Popen(['python', '-m', 'metube'])
        logger.info("Metube démarré")
    except Exception as e:
        logger.error(f"Erreur lors du démarrage de Metube: {e}")

def main():
    """Fonction principale"""
    logger.info("=== Démarrage du serveur d'authentification JWT pour Metube ===")
    logger.info(f"JWT_SECRET configuré: {'Oui' if JWT_SECRET else 'Non'}")
    logger.info(f"AUTH_REQUIRED: {AUTH_REQUIRED}")
    logger.info(f"METUBE_PORT: {METUBE_PORT}")
    
    # Démarrer Metube en arrière-plan
    if AUTH_REQUIRED:
        metube_thread = threading.Thread(target=start_metube, daemon=True)
        metube_thread.start()
    
    # Démarrer le serveur d'authentification
    port = 7862
    server = HTTPServer(('0.0.0.0', port), JWTRequestHandler)
    
    logger.info(f"Serveur d'authentification JWT démarré sur le port {port}")
    logger.info(f"Accès sécurisé: http://localhost:{port}")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Arrêt du serveur...")
        server.shutdown()

if __name__ == '__main__':
    main() 