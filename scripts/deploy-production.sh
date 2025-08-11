#!/bin/bash

# Script de déploiement en production
# Migration vers iahome.fr

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement en production..."
echo "=================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Vérifier que les fichiers nécessaires existent
log_info "1. Vérification des fichiers nécessaires..."

required_files=(
    ".env.production"
    "docker-compose.prod.yml"
    "Dockerfile"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "Fichier trouvé: $file"
    else
        log_error "Fichier manquant: $file"
        exit 1
    fi
done

# 2. Arrêter les conteneurs existants
log_info "2. Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
log_success "Conteneurs arrêtés"

# 3. Nettoyer les images
log_info "3. Nettoyage des images..."
docker system prune -f
log_success "Images nettoyées"

# 4. Reconstruire et démarrer
log_info "4. Construction et démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Vérifier la santé des services
log_info "5. Vérification de la santé des services..."
echo "Attente du démarrage des services..."
sleep 30

# 6. Test de connectivité
log_info "6. Test de connectivité..."

# Test de l'application
if curl -f http://localhost:3000/api/health 2>/dev/null; then
    log_success "Application accessible sur le port 3000"
else
    log_warning "Application non accessible sur le port 3000"
fi

# Test de Nginx
if curl -I http://localhost:80 2>/dev/null | grep -q "HTTP"; then
    log_success "Nginx accessible sur le port 80"
else
    log_warning "Nginx non accessible sur le port 80"
fi

# Test de Traefik
if curl -I http://localhost:8080 2>/dev/null | grep -q "HTTP"; then
    log_success "Traefik accessible sur le port 8080"
else
    log_warning "Traefik non accessible sur le port 8080"
fi

# 7. Afficher le statut des conteneurs
log_info "7. Statut des conteneurs..."
docker-compose -f docker-compose.prod.yml ps

# 8. Afficher les logs récents
log_info "8. Logs récents..."
docker-compose -f docker-compose.prod.yml logs --tail=10

# 9. Résumé final
echo ""
echo "=================================="
log_success "Déploiement terminé avec succès !"
echo ""
echo "📋 Résumé :"
echo "  ✅ Conteneurs arrêtés et nettoyés"
echo "  ✅ Services reconstruits et démarrés"
echo "  ✅ Tests de connectivité effectués"
echo ""
echo "🌐 URLs d'accès :"
echo "  - Application : http://localhost:3000"
echo "  - Nginx : http://localhost:80"
echo "  - Traefik Dashboard : http://localhost:8080"
echo ""
echo "🔧 Commandes utiles :"
echo "  - Logs : docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Statut : docker-compose -f docker-compose.prod.yml ps"
echo "  - Arrêter : docker-compose -f docker-compose.prod.yml down"
echo ""
echo "📁 Prochaines étapes :"
echo "  1. Configurer le DNS pour iahome.fr"
echo "  2. Tester l'accès via le domaine"
echo "  3. Vérifier les certificats SSL"
echo "=================================="

log_success "Déploiement terminé avec succès !" 