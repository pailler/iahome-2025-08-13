#!/bin/bash

# Script de déploiement pour iahome.fr
set -e

echo "🚀 Déploiement de iahome.fr en cours..."

# Variables
PROJECT_NAME="iahome"
DOMAIN="iahome.fr"
DOCKER_REGISTRY=""
IMAGE_TAG="latest"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé"
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé"
    exit 1
fi

# Vérifier que le fichier .env.production existe
if [ ! -f ".env.production" ]; then
    log_error "Le fichier .env.production n'existe pas"
    log_info "Copiez env.production.example vers .env.production et configurez-le"
    exit 1
fi

# Arrêter les conteneurs existants
log_info "Arrêt des conteneurs existants..."
docker-compose down --remove-orphans

# Nettoyer les images anciennes
log_info "Nettoyage des images Docker..."
docker system prune -f

# Construire l'image
log_info "Construction de l'image Docker..."
docker-compose build --no-cache

# Démarrer les services
log_info "Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
log_info "Attente du démarrage des services..."
sleep 30

# Vérifier la santé des services
log_info "Vérification de la santé des services..."

# Vérifier l'application principale
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log_info "✅ Application principale opérationnelle"
else
    log_error "❌ Application principale non accessible"
    docker-compose logs iahome
    exit 1
fi

# Vérifier Nginx
if curl -f http://localhost/health > /dev/null 2>&1; then
    log_info "✅ Nginx opérationnel"
else
    log_error "❌ Nginx non accessible"
    docker-compose logs nginx
    exit 1
fi

# Vérifier les certificats SSL
if [ -f "nginx/ssl/iahome.fr.crt" ] && [ -f "nginx/ssl/iahome.fr.key" ]; then
    log_info "✅ Certificats SSL présents"
else
    log_warn "⚠️  Certificats SSL manquants"
    log_info "Vous devrez configurer les certificats SSL dans nginx/ssl/"
fi

# Afficher les informations de déploiement
log_info "🎉 Déploiement terminé avec succès!"
echo ""
echo "📋 Informations de déploiement:"
echo "   - Application: http://localhost:3000"
echo "   - Nginx: http://localhost"
echo "   - Domaine: https://$DOMAIN"
echo ""
echo "🔧 Commandes utiles:"
echo "   - Voir les logs: docker-compose logs -f"
echo "   - Redémarrer: docker-compose restart"
echo "   - Arrêter: docker-compose down"
echo "   - Mettre à jour: ./scripts/deploy.sh"
echo ""

# Vérifier les variables d'environnement critiques
log_info "🔍 Vérification des variables d'environnement..."

if [ -z "$(grep 'JWT_SECRET' .env.production | cut -d'=' -f2)" ]; then
    log_warn "⚠️  JWT_SECRET n'est pas configuré"
fi

if [ -z "$(grep 'MAGIC_LINK_SECRET' .env.production | cut -d'=' -f2)" ]; then
    log_warn "⚠️  MAGIC_LINK_SECRET n'est pas configuré"
fi

if [ -z "$(grep 'NEXTAUTH_SECRET' .env.production | cut -d'=' -f2)" ]; then
    log_warn "⚠️  NEXTAUTH_SECRET n'est pas configuré"
fi

echo ""
log_info "✅ Déploiement terminé!" 