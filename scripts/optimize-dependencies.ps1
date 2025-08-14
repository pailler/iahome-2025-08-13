# Script d'optimisation des dépendances npm
Write-Host "Optimisation des dépendances npm" -ForegroundColor Green

# 1. Arrêter le serveur
Write-Host "Arret du serveur..." -ForegroundColor Yellow
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "Serveur arrete" -ForegroundColor Green
}

# 2. Sauvegarder le package.json actuel
Write-Host "Sauvegarde du package.json..." -ForegroundColor Yellow
Copy-Item "package.json" "package.json.backup" -Force
Write-Host "Sauvegarde creee: package.json.backup" -ForegroundColor Green

# 3. Analyser les dépendances actuelles
Write-Host "Analyse des dependances..." -ForegroundColor Yellow
$currentDeps = Get-Content "package.json" | ConvertFrom-Json

Write-Host "Dependances principales:" -ForegroundColor Cyan
$currentDeps.dependencies.PSObject.Properties | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor White
}

Write-Host "Dependances de developpement:" -ForegroundColor Cyan
$currentDeps.devDependencies.PSObject.Properties | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor White
}

# 4. Créer un package.json ultra-optimisé
Write-Host "Creation du package.json ultra-optimise..." -ForegroundColor Yellow

$optimizedPackage = @{
    name = $currentDeps.name
    version = $currentDeps.version
    private = $currentDeps.private
    scripts = $currentDeps.scripts
    dependencies = @{
        # Dépendances CRITIQUES uniquement
        "@supabase/supabase-js" = "^2.52.1"
        "next" = "15.4.4"
        "react" = "19.1.0"
        "react-dom" = "19.1.0"
        "stripe" = "^18.3.0"
        "jsonwebtoken" = "^9.0.2"
    }
    devDependencies = @{
        # Dépendances de développement CRITIQUES uniquement
        "@types/node" = "^20"
        "@types/react" = "^19"
        "@types/react-dom" = "^19"
        "@types/jsonwebtoken" = "^9.0.10"
        "typescript" = "^5"
        "eslint" = "^9"
        "eslint-config-next" = "15.4.4"
        "tailwindcss" = "^4"
        "@tailwindcss/postcss" = "^4"
    }
}

# Convertir en JSON et sauvegarder
$optimizedPackage | ConvertTo-Json -Depth 10 | Set-Content "package.json.optimized"

# 5. Supprimer node_modules et package-lock.json
Write-Host "Suppression de node_modules et package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "node_modules supprime" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "package-lock.json supprime" -ForegroundColor Green
}

# 6. Nettoyer le cache npm
Write-Host "Nettoyage du cache npm..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "Cache npm nettoye" -ForegroundColor Green

# 7. Installer les dépendances ultra-optimisées
Write-Host "Installation des dependances ultra-optimisees..." -ForegroundColor Yellow
Copy-Item "package.json.optimized" "package.json" -Force
npm install --production=false

# 8. Vérifier le résultat
Write-Host "Verification du resultat..." -ForegroundColor Yellow
$newCount = (Get-ChildItem node_modules -Recurse -Directory | Measure-Object).Count
Write-Host "Nombre de dossiers dans node_modules: $newCount" -ForegroundColor Cyan

# 9. Analyser les dépendances installées
Write-Host "Analyse des dependances installees..." -ForegroundColor Yellow
npm list --depth=0

Write-Host "Optimisation terminee!" -ForegroundColor Green
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "1. Tester le projet: npm run dev" -ForegroundColor White
Write-Host "2. Si tout fonctionne, supprimer package.json.backup" -ForegroundColor White
Write-Host "3. Si probleme, restaurer: Copy-Item package.json.backup package.json" -ForegroundColor White
