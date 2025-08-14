# Script pour vérifier le nombre de modules compilés
Write-Host "Vérification des modules compilés" -ForegroundColor Green

# 1. Vérifier si le serveur fonctionne
$port = 3000
$connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue

if ($connection.TcpTestSucceeded) {
    Write-Host "Serveur actif sur le port $port" -ForegroundColor Green
} else {
    Write-Host "Serveur non accessible sur le port $port" -ForegroundColor Red
    exit 1
}

# 2. Compter les fichiers dans node_modules
$nodeModulesCount = (Get-ChildItem -Path "node_modules" -Recurse -File | Measure-Object).Count
Write-Host "`nFichiers dans node_modules: $nodeModulesCount" -ForegroundColor Cyan

# 3. Analyser les dépendances principales
Write-Host "`nDépendances principales:" -ForegroundColor Yellow
npm list --depth=0

# 4. Vérifier la taille de node_modules
$nodeModulesSize = (Get-ChildItem -Path "node_modules" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "`nTaille de node_modules: $([math]::Round($nodeModulesSize, 2)) MB" -ForegroundColor Cyan

# 5. Suggestions d'optimisation
Write-Host "`nSuggestions d'optimisation:" -ForegroundColor Yellow
Write-Host "- Supprimer les dépendances de développement en production" -ForegroundColor White
Write-Host "- Utiliser des imports dynamiques pour réduire le bundle" -ForegroundColor White
Write-Host "- Optimiser les images et assets" -ForegroundColor White

Write-Host "`nAnalyse terminée!" -ForegroundColor Green
