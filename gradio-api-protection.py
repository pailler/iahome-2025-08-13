#!/usr/bin/env python3
"""
Protection par Clé API pour StableDiffusion
Alternative à la protection par mot de passe
"""

import gradio as gr
import os
import json
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class APIKeyProtection:
    def __init__(self, keys_file: str = "api_keys.json"):
        self.keys_file = keys_file
        self.valid_keys = self.load_keys()
        self.active_sessions = {}  # session_id -> {key, expires_at}
        self.session_timeout = timedelta(hours=24)  # Session valide 24h
        
    def load_keys(self) -> List[str]:
        """Charge les clés API depuis le fichier"""
        if os.path.exists(self.keys_file):
            try:
                with open(self.keys_file, 'r') as f:
                    data = json.load(f)
                    return data.get('keys', [])
            except Exception as e:
                print(f"Erreur lors du chargement des clés: {e}")
        return []
    
    def save_keys(self):
        """Sauvegarde les clés API dans le fichier"""
        try:
            data = {'keys': self.valid_keys, 'updated_at': datetime.now().isoformat()}
            with open(self.keys_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Erreur lors de la sauvegarde des clés: {e}")
    
    def add_key(self, new_key: str) -> bool:
        """Ajoute une nouvelle clé API"""
        if new_key and new_key not in self.valid_keys:
            self.valid_keys.append(new_key)
            self.save_keys()
            return True
        return False
    
    def remove_key(self, key_to_remove: str) -> bool:
        """Supprime une clé API"""
        if key_to_remove in self.valid_keys:
            self.valid_keys.remove(key_to_remove)
            self.save_keys()
            return True
        return False
    
    def validate_key(self, api_key: str) -> Optional[str]:
        """Valide une clé API et retourne un session_id"""
        if api_key in self.valid_keys:
            session_id = hashlib.sha256(f"{api_key}{time.time()}".encode()).hexdigest()[:16]
            self.active_sessions[session_id] = {
                'key': api_key,
                'expires_at': datetime.now() + self.session_timeout
            }
            return session_id
        return None
    
    def validate_session(self, session_id: str) -> bool:
        """Valide une session existante"""
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            if datetime.now() < session['expires_at']:
                return True
            else:
                # Session expirée
                del self.active_sessions[session_id]
        return False
    
    def cleanup_expired_sessions(self):
        """Nettoie les sessions expirées"""
        now = datetime.now()
        expired_sessions = [
            session_id for session_id, session in self.active_sessions.items()
            if now >= session['expires_at']
        ]
        for session_id in expired_sessions:
            del self.active_sessions[session_id]

def create_protected_interface():
    """Crée l'interface Gradio avec protection par clé API"""
    
    # Initialiser la protection
    protection = APIKeyProtection()
    
    # Interface de connexion
    def login_interface(api_key: str):
        """Interface de connexion avec clé API"""
        if not api_key:
            return gr.HTML("""
                <div style="text-align: center; padding: 50px;">
                    <h2>🔐 Accès StableDiffusion</h2>
                    <p>Veuillez entrer votre clé API pour accéder au service.</p>
                    <p style="color: #666; font-size: 14px;">
                        Contactez l'administrateur pour obtenir une clé API.
                    </p>
                </div>
            """), gr.update(visible=False)
        
        session_id = protection.validate_key(api_key)
        if session_id:
            return gr.HTML("""
                <div style="text-align: center; padding: 20px; color: green;">
                    <h3>✅ Accès autorisé</h3>
                    <p>Redirection vers l'interface StableDiffusion...</p>
                </div>
            """), gr.update(visible=True)
        else:
            return gr.HTML("""
                <div style="text-align: center; padding: 20px; color: red;">
                    <h3>❌ Clé API invalide</h3>
                    <p>Veuillez vérifier votre clé API et réessayer.</p>
                </div>
            """), gr.update(visible=False)
    
    # Interface d'administration des clés
    def admin_interface():
        """Interface d'administration des clés API"""
        keys = protection.valid_keys
        keys_text = "\n".join([f"• {key}" for key in keys]) if keys else "Aucune clé configurée"
        
        return f"""
        <div style="padding: 20px;">
            <h3>🔑 Gestion des Clés API</h3>
            <p><strong>Clés actives ({len(keys)}):</strong></p>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">{keys_text}</pre>
            
            <h4>Ajouter une nouvelle clé:</h4>
            <p>Utilisez les contrôles ci-dessous pour gérer les clés API.</p>
        </div>
        """
    
    def add_new_key(new_key: str):
        """Ajoute une nouvelle clé API"""
        if protection.add_key(new_key):
            return f"✅ Clé ajoutée: {new_key}", admin_interface()
        else:
            return "❌ Erreur: Clé invalide ou déjà existante", admin_interface()
    
    def remove_existing_key(key_to_remove: str):
        """Supprime une clé API existante"""
        if protection.remove_key(key_to_remove):
            return f"✅ Clé supprimée: {key_to_remove}", admin_interface()
        else:
            return "❌ Erreur: Clé non trouvée", admin_interface()
    
    def generate_random_key():
        """Génère une clé API aléatoire"""
        import secrets
        new_key = f"sd_{secrets.token_hex(16)}"
        return new_key
    
    # Interface principale
    with gr.Blocks(title="StableDiffusion - Protection API", theme=gr.themes.Soft()) as demo:
        
        # Variables d'état
        session_state = gr.State("")
        is_authenticated = gr.State(False)
        
        with gr.Tabs():
            # Onglet de connexion
            with gr.TabItem("🔐 Connexion"):
                gr.HTML("""
                    <div style="text-align: center; padding: 20px;">
                        <h1>🎨 StableDiffusion</h1>
                        <h3>Protection par Clé API</h3>
                        <p>Entrez votre clé API pour accéder au service.</p>
                    </div>
                """)
                
                with gr.Row():
                    with gr.Column(scale=2):
                        api_key_input = gr.Textbox(
                            label="Clé API",
                            placeholder="Entrez votre clé API...",
                            type="password",
                            lines=1
                        )
                        login_btn = gr.Button("🔓 Se connecter", variant="primary")
                    
                    with gr.Column(scale=1):
                        gr.HTML("""
                            <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
                                <h4>💡 Information</h4>
                                <p style="margin: 0; font-size: 14px;">
                                    La clé API remplace la protection par mot de passe.<br>
                                    Contactez l'administrateur pour obtenir une clé.
                                </p>
                            </div>
                        """)
                
                login_status = gr.HTML()
                main_interface = gr.Group(visible=False)
                
                # Interface StableDiffusion (à personnaliser selon vos besoins)
                with main_interface:
                    gr.HTML("""
                        <div style="text-align: center; padding: 20px; background: #e8f5e8; border-radius: 8px;">
                            <h2>🎨 Interface StableDiffusion</h2>
                            <p>Votre interface StableDiffusion sera intégrée ici.</p>
                            <p style="color: #666;">Session active - Vous pouvez maintenant utiliser StableDiffusion.</p>
                        </div>
                    """)
                    
                    # Exemple d'intégration StableDiffusion
                    with gr.Row():
                        with gr.Column():
                            prompt_input = gr.Textbox(
                                label="Prompt",
                                placeholder="Une belle image de paysage...",
                                lines=3
                            )
                            generate_btn = gr.Button("🎨 Générer", variant="primary")
                        
                        with gr.Column():
                            output_image = gr.Image(label="Image générée")
                    
                    # Placeholder pour la logique de génération
                    def generate_image(prompt):
                        # Ici vous intégreriez votre logique StableDiffusion
                        return None  # Retourner l'image générée
                    
                    generate_btn.click(
                        fn=generate_image,
                        inputs=[prompt_input],
                        outputs=[output_image]
                    )
                
                # Logique de connexion
                def handle_login(api_key):
                    session_id = protection.validate_key(api_key)
                    if session_id:
                        return (
                            gr.HTML("""
                                <div style="text-align: center; padding: 20px; color: green; background: #e8f5e8; border-radius: 8px;">
                                    <h3>✅ Connexion réussie</h3>
                                    <p>Accès autorisé à StableDiffusion</p>
                                </div>
                            """),
                            gr.update(visible=True),
                            session_id,
                            True
                        )
                    else:
                        return (
                            gr.HTML("""
                                <div style="text-align: center; padding: 20px; color: red; background: #ffe8e8; border-radius: 8px;">
                                    <h3>❌ Clé API invalide</h3>
                                    <p>Veuillez vérifier votre clé et réessayer.</p>
                                </div>
                            """),
                            gr.update(visible=False),
                            "",
                            False
                        )
                
                login_btn.click(
                    fn=handle_login,
                    inputs=[api_key_input],
                    outputs=[login_status, main_interface, session_state, is_authenticated]
                )
            
            # Onglet d'administration (optionnel)
            with gr.TabItem("⚙️ Administration"):
                gr.HTML("""
                    <div style="text-align: center; padding: 20px;">
                        <h2>🔧 Administration des Clés API</h2>
                        <p>Gérez les clés API pour l'accès à StableDiffusion.</p>
                    </div>
                """)
                
                admin_status = gr.HTML(admin_interface())
                
                with gr.Row():
                    with gr.Column():
                        new_key_input = gr.Textbox(
                            label="Nouvelle clé API",
                            placeholder="Entrez une nouvelle clé...",
                            lines=1
                        )
                        add_btn = gr.Button("➕ Ajouter", variant="primary")
                    
                    with gr.Column():
                        generate_btn_admin = gr.Button("🎲 Générer une clé")
                        generated_key = gr.Textbox(
                            label="Clé générée",
                            interactive=False,
                            lines=1
                        )
                
                with gr.Row():
                    remove_key_input = gr.Textbox(
                        label="Clé à supprimer",
                        placeholder="Entrez la clé à supprimer...",
                        lines=1
                    )
                    remove_btn = gr.Button("🗑️ Supprimer", variant="stop")
                
                # Logique d'administration
                add_btn.click(
                    fn=add_new_key,
                    inputs=[new_key_input],
                    outputs=[gr.Textbox(label="Statut"), admin_status]
                )
                
                generate_btn_admin.click(
                    fn=generate_random_key,
                    outputs=[generated_key]
                )
                
                remove_btn.click(
                    fn=remove_existing_key,
                    inputs=[remove_key_input],
                    outputs=[gr.Textbox(label="Statut"), admin_status]
                )
        
        # Nettoyage périodique des sessions expirées
        def cleanup_sessions():
            protection.cleanup_expired_sessions()
            return "Sessions nettoyées"
        
        # Exécuter le nettoyage toutes les heures
        demo.load(cleanup_sessions, outputs=[gr.Textbox(visible=False)])
    
    return demo

def create_simple_protection():
    """Version simplifiée pour intégration directe"""
    
    protection = APIKeyProtection()
    
    def check_access(api_key: str) -> bool:
        """Vérifie l'accès avec une clé API"""
        return api_key in protection.valid_keys
    
    def create_simple_interface():
        with gr.Blocks() as demo:
            gr.HTML("""
                <div style="text-align: center; padding: 20px;">
                    <h2>🔐 Accès StableDiffusion</h2>
                    <p>Entrez votre clé API pour continuer</p>
                </div>
            """)
            
            api_key = gr.Textbox(label="Clé API", type="password")
            access_btn = gr.Button("Accéder")
            status = gr.HTML()
            
            def verify_access(key):
                if check_access(key):
                    return gr.HTML("""
                        <div style="color: green; text-align: center;">
                            <h3>✅ Accès autorisé</h3>
                            <p>Redirection vers StableDiffusion...</p>
                        </div>
                    """)
                else:
                    return gr.HTML("""
                        <div style="color: red; text-align: center;">
                            <h3>❌ Clé invalide</h3>
                            <p>Vérifiez votre clé API</p>
                        </div>
                    """)
            
            access_btn.click(fn=verify_access, inputs=[api_key], outputs=[status])
        
        return demo
    
    return create_simple_interface()

if __name__ == "__main__":
    # Créer l'interface complète
    demo = create_protected_interface()
    
    # Configuration du serveur
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        auth=None,  # Désactiver l'auth Gradio par défaut
        show_error=True
    ) 