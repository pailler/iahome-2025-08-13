#!/bin/bash

# Script de déploiement pour NAS Nuxit avec iahome.fr
# À exécuter sur votre NAS

echo "🚀 Déploiement iahome.fr sur NAS Nuxit"

# 1. Créer le réseau Docker
echo "📦 Création du réseau Docker..."
docker network create traefik-network

# 2. Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p traefik/letsencrypt
mkdir -p traefik/dynamic
chmod 600 traefik/letsencrypt

# 3. Modifier la configuration Traefik avec votre email
echo "📧 Configuration de votre email dans Traefik..."
read -p "Entrez votre email pour Let's Encrypt: " email
sed -i "s/votre-email@example.com/$email/g" traefik/traefik.yml

# 4. Construire l'image de l'application
echo "🔨 Construction de l'image Docker..."
docker build -t iahome-iahome-app:latest .

# 5. Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose -f traefik/traefik-nas.yml up -d

# 6. Vérifier le statut
echo "✅ Vérification du statut..."
docker-compose -f traefik/traefik-nas.yml ps

echo "🎉 Déploiement terminé !"
echo "🌐 Votre site sera accessible sur: https://iahome.fr"
echo "📊 Dashboard Traefik: https://traefik.iahome.fr"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifiez que les ports 80 et 443 sont ouverts sur votre routeur"
echo "2. Attendez 5-10 minutes pour la génération du certificat SSL"
echo "3. Testez l'accès à https://iahome.fr"



