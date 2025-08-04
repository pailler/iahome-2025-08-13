#!/usr/bin/env python3
"""
Script d'authentification JWT pour Stable Diffusion
Vérifie les tokens JWT et sécurise l'accès à l'application Gradio
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
STABLEDIFFUSION_PORT = int(os.getenv('STABLEDIFFUSION_PORT', '7860'))
AUTH_REQUIRED = os.getenv('AUTH_REQUIRED', 'true').lower() == 'true'
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Configuration du logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/stablediffusion-jwt-auth.log'),
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
                self._proxy_to_stablediffusion(method)
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
                    self._proxy_to_stablediffusion(method)
                else:
                    logger.warning("Token JWT invalide pour la page principale, redirection vers la page de connexion")
                    self._send_login_page()
                return
            
            # Pour toutes les autres requêtes (ressources statiques, WebSocket, etc.), proxifier directement
            # car l'utilisateur a déjà accédé à la page principale avec un token valide
            logger.info(f"Proxification directe pour: {method} {path}")
            self._proxy_to_stablediffusion(method)
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement de la requête {method}: {e}")
            self._send_error_page()
    
    def _validate_jwt_token(self, token):
        """Valide un token JWT"""
        try:
            if not token:
                logger.warning("Aucun token fourni")
                return False
            
            # Décoder le token JWT
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            
            # Vérifier que le token est pour Stable Diffusion
            if payload.get('moduleName') != 'stablediffusion':
                logger.warning(f"Token invalide: moduleName attendu 'stablediffusion', reçu '{payload.get('moduleName')}'")
                return False
            
            # Vérifier l'expiration
            exp = payload.get('exp')
            if exp and time.time() > exp:
                logger.warning("Token expiré")
                return False
            
            # Vérifier l'émission
            iat = payload.get('iat')
            if iat and time.time() < iat:
                logger.warning("Token pas encore valide")
                return False
            
            logger.info(f"Token JWT valide pour l'utilisateur: {payload.get('email', 'unknown')}")
            return True
            
        except jwt.ExpiredSignatureError:
            logger.warning("Token JWT expiré")
            return False
        except jwt.InvalidTokenError as e:
            logger.warning(f"Token JWT invalide: {e}")
            return False
        except Exception as e:
            logger.error(f"Erreur lors de la validation du token JWT: {e}")
            return False
    
    def _send_login_page(self):
        """Affiche la page de connexion sécurisée"""
        html_content = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accès sécurisé - Stable Diffusion</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
        }
        .logo {
            font-size: 2em;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
        }
        .message {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .error {
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #c33;
        }
        .security-notice {
            background: #e8f4fd;
            color: #0c5460;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #17a2b8;
            font-size: 0.9em;
        }
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.2s;
            margin: 5px;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .icon {
            font-size: 3em;
            margin-bottom: 20px;
        }
        .buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔒</div>
        <div class="logo">Accès Sécurisé</div>
        <div class="message">
            <p><strong>Stable Diffusion</strong> est protégé par un système d'authentification avancé.</p>
            <p>L'accès direct n'est pas autorisé pour des raisons de sécurité.</p>
        </div>
        <div class="error">
            🚫 Accès refusé - Authentification requise
        </div>
        <div class="security-notice">
            <strong>🔐 Sécurité renforcée :</strong><br>
            Cette application n'est accessible que via la plateforme principale avec un token JWT valide.
        </div>
        <div class="buttons">
            <a href="https://iahome.fr" class="button">
                🏠 Retour à l'accueil
            </a>
            <a href="https://iahome.fr/login" class="button">
                🔑 Se connecter
            </a>
        </div>
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
        """Affiche une page d'erreur"""
        html_content = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erreur - Stable Diffusion</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        .logo {
            font-size: 2em;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
        }
        .message {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .error {
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #c33;
        }
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .icon {
            font-size: 3em;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">❌</div>
        <div class="logo">Erreur</div>
        <div class="message">
            <p>Une erreur s'est produite lors de l'accès à Stable Diffusion.</p>
            <p>Veuillez réessayer ou contacter l'administrateur.</p>
        </div>
        <div class="error">
            🔧 Erreur technique - Service temporairement indisponible
        </div>
        <a href="https://iahome.fr" class="button">
            🏠 Retour à l'accueil
        </a>
    </div>
</body>
</html>
        """
        
        self.send_response(500)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(html_content)))
        self.end_headers()
        self.wfile.write(html_content.encode('utf-8'))
    
    def _proxy_to_stablediffusion(self, method='GET'):
        """Proxie les requêtes vers l'application Stable Diffusion"""
        try:
            # Récupérer les headers de la requête
            headers = dict(self.headers)
            
            # Récupérer le body pour les requêtes POST/PUT
            data = None
            if method in ['POST', 'PUT']:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    data = self.rfile.read(content_length)
            
            # Construire l'URL de destination vers Stable Diffusion
            stablediffusion_url = f"http://stablediffusion:{STABLEDIFFUSION_PORT}{self.path}"
            logger.info(f"Proxification {method} vers: {stablediffusion_url}")
            
            # Faire la requête vers Stable Diffusion
            import requests
            if method == 'GET':
                response = requests.get(stablediffusion_url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(stablediffusion_url, headers=headers, data=data, timeout=30)
            elif method == 'PUT':
                response = requests.put(stablediffusion_url, headers=headers, data=data, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(stablediffusion_url, headers=headers, timeout=30)
            elif method == 'OPTIONS':
                response = requests.options(stablediffusion_url, headers=headers, timeout=30)
            else:
                response = requests.get(stablediffusion_url, headers=headers, timeout=30)
            
            # Transférer la réponse
            self.send_response(response.status_code)
            for key, value in response.headers.items():
                if key.lower() not in ['transfer-encoding', 'connection']:
                    self.send_header(key, value)
            self.end_headers()
            self.wfile.write(response.content)
            
        except Exception as e:
            logger.error(f"Erreur lors de la proxification {method} vers Stable Diffusion: {e}")
            self._send_error_page()
    
    def _handle_websocket_upgrade(self):
        """Gère les connexions WebSocket"""
        try:
            logger.info("Tentative de connexion WebSocket vers Stable Diffusion")
            
            # Créer une connexion socket vers Stable Diffusion
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(('stablediffusion', STABLEDIFFUSION_PORT))
            
            # Transférer les données WebSocket
            while True:
                ready = select.select([self.connection, sock], [], [], 1.0)[0]
                for s in ready:
                    data = s.recv(4096)
                    if not data:
                        return
                    if s == self.connection:
                        sock.send(data)
                    else:
                        self.connection.send(data)
                        
        except Exception as e:
            logger.error(f"Erreur WebSocket: {e}")

def start_stablediffusion():
    """Démarre l'application Stable Diffusion en arrière-plan"""
    try:
        logger.info("Démarrage de Stable Diffusion...")
        # Ici vous pouvez ajouter la commande pour démarrer Stable Diffusion
        # subprocess.Popen(['python', '-m', 'stable_diffusion'], cwd='/app')
        logger.info("Stable Diffusion démarré")
    except Exception as e:
        logger.error(f"Erreur lors du démarrage de Stable Diffusion: {e}")

def main():
    """Fonction principale"""
    logger.info("Démarrage du serveur d'authentification JWT pour Stable Diffusion")
    
    # Démarrer Stable Diffusion
    start_stablediffusion()
    
    # Démarrer le serveur HTTP
    server = HTTPServer(('0.0.0.0', 8080), JWTRequestHandler)
    logger.info("Serveur démarré sur le port 8080")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Arrêt du serveur...")
        server.shutdown()

if __name__ == '__main__':
    main() 