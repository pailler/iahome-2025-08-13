# Script d'analyse et nettoyage des dépendances npm
Write-Host "Analyse des dépendances npm" -ForegroundColor Green

# 1. Afficher les dépendances actuelles
Write-Host "`nDépendances actuelles:" -ForegroundColor Yellow
npm list --depth=0

# 2. Analyser les dépendances non utilisées
Write-Host "`nAnalyse des dépendances non utilisées..." -ForegroundColor Yellow
npm audit --audit-level=moderate

# 3. Nettoyer le cache npm
Write-Host "`nNettoyage du cache npm..." -ForegroundColor Yellow
npm cache clean --force

# 4. Supprimer node_modules et package-lock.json
Write-Host "`nSuppression de node_modules et package-lock.json..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue

# 5. Créer un package.json ultra-minimal
Write-Host "`nCréeation d'un package.json ultra-minimal..." -ForegroundColor Yellow
$minimalPackage = @{
    version = "0.1.0"
    name = "iahome"
    scripts = @{
        dev = "next dev -p 3000"
        build = "next build"
        start = "next start"
        lint = "next lint"
    }
    devDependencies = @{
        "@types/node" = "^20"
        "@types/react" = "^19"
        "@types/react-dom" = "^19"
        "typescript" = "^5"
    }
    dependencies = @{
        "@supabase/supabase-js" = "^2.52.1"
        "next" = "15.4.4"
        "react" = "19.1.0"
        "react-dom" = "19.1.0"
    }
    private = $true
}

$minimalPackage | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# 6. Installer les dépendances minimales
Write-Host "`nInstallation des dépendances minimales..." -ForegroundColor Yellow
npm install

# 7. Vérifier le résultat
Write-Host "`nRésultat après optimisation:" -ForegroundColor Green
npm list --depth=0

Write-Host "`nOptimisation terminée!" -ForegroundColor Green
Write-Host "Redémarrez le serveur avec: npm run dev" -ForegroundColor Yellow
