# Script PowerShell pour redémarrer l'application IAHome
# Usage: .\scripts\restart-app.ps1

Write-Host "🔄 Redémarrage de l'application IAHome..." -ForegroundColor Green

# 1. Arrêter l'application si elle tourne
Write-Host "📴 Arrêt de l'application..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# 2. Vider le cache Next.js
Write-Host "🧹 Vidage du cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
}

# 3. Vider le cache npm
Write-Host "🧹 Vidage du cache npm..." -ForegroundColor Yellow
npm cache clean --force

# 4. Réinstaller les dépendances si nécessaire
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow
npm install

# 5. Reconstruire l'application
Write-Host "🔨 Reconstruction de l'application..." -ForegroundColor Yellow
npm run build

# 6. Redémarrer l'application
Write-Host "🚀 Redémarrage de l'application..." -ForegroundColor Yellow
Start-Process -NoNewWindow npm -ArgumentList "run", "start"

Write-Host "✅ Application redémarrée !" -ForegroundColor Green
Write-Host "🌐 Accédez à https://iahome.fr pour tester" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Instructions de test :" -ForegroundColor White
Write-Host "1. Connectez-vous à votre compte" -ForegroundColor White
Write-Host "2. Allez sur la page d'accueil" -ForegroundColor White
Write-Host "3. Cliquez sur 'Choisir' pour un module" -ForegroundColor White
Write-Host "4. Cliquez sur 'Activer' pour le paiement" -ForegroundColor White
Write-Host "5. Complétez le paiement Stripe" -ForegroundColor White
Write-Host "6. Vérifiez la redirection vers /success" -ForegroundColor White
Write-Host "7. Cliquez sur 'Page encours' pour voir vos modules" -ForegroundColor White
