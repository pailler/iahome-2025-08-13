#!/bin/bash

# Script pour redémarrer l'application et vider le cache
# Usage: ./scripts/restart-app.sh

echo "🔄 Redémarrage de l'application IAHome..."

# 1. Arrêter l'application si elle tourne
echo "📴 Arrêt de l'application..."
pkill -f "next"
pkill -f "node.*next"

# 2. Vider le cache Next.js
echo "🧹 Vidage du cache Next.js..."
rm -rf .next
rm -rf node_modules/.cache

# 3. Vider le cache npm/yarn
echo "🧹 Vidage du cache npm..."
npm cache clean --force

# 4. Réinstaller les dépendances si nécessaire
echo "📦 Vérification des dépendances..."
npm install

# 5. Reconstruire l'application
echo "🔨 Reconstruction de l'application..."
npm run build

# 6. Redémarrer l'application
echo "🚀 Redémarrage de l'application..."
npm run start &

echo "✅ Application redémarrée !"
echo "🌐 Accédez à https://iahome.fr pour tester"
echo ""
echo "📋 Instructions de test :"
echo "1. Connectez-vous à votre compte"
echo "2. Allez sur la page d'accueil"
echo "3. Cliquez sur 'Choisir' pour un module"
echo "4. Cliquez sur 'Activer' pour le paiement"
echo "5. Complétez le paiement Stripe"
echo "6. Vérifiez la redirection vers /success"
echo "7. Cliquez sur 'Page encours' pour voir vos modules"
